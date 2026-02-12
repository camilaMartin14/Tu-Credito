import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { simulateLoan, createLoan } from '../../services/loanService';
import { getBorrowers } from '../../services/borrowerService';
import { SimulacionPrestamoOutputDTO } from '../../types';
import { Loader2, Calculator, CheckCircle, User, Search } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ConfirmationModal } from '../ui/ConfirmationModal';

import { useToast } from '../../context/ToastContext';
import { useLoanAliases } from '../../hooks/useLoanAliases';

import { LoanStatus } from '../../types/enums';

const loanSchema = z.object({
  dniPrestatario: z.string().min(7, "El DNI debe tener al menos 7 números"),
  nombrePrestatario: z.string().min(3, "El nombre completo es obligatorio"),
  montoOtorgado: z.number().refine((val) => !Number.isNaN(val), { message: "El monto es obligatorio" }).refine((val) => val >= 50, { message: "El monto debe ser mayor o igual a 50" }),
  cantidadCtas: z.number().refine((val) => !Number.isNaN(val), { message: "La cantidad de cuotas es obligatoria" }).refine((val) => val >= 1, { message: "Debe haber al menos 1 cuota" }),
  tasaInteres: z.number().refine((val) => !Number.isNaN(val), { message: "La tasa de interés es obligatoria" }).refine((val) => val >= 0, { message: "La tasa no puede ser negativa" }),
  idSistAmortizacion: z.number(),
  moneda: z.enum(["ARS", "USD"]),
  fechaOtorgamiento: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Fecha inválida" }),
  fec1erVto: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Fecha inválida" }),
});

type LoanFormData = z.infer<typeof loanSchema>;

export function LoanForm() {
  const { addToast } = useToast();
  const { setAlias } = useLoanAliases();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [simulation, setSimulation] = useState<SimulacionPrestamoOutputDTO | null>(null);
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string>("");
  const [alias, setAliasInput] = useState('');
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [pendingData, setPendingData] = useState<LoanFormData | null>(null);
  
  const { register, handleSubmit, formState: { errors }, getValues, setValue, watch, reset } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      idSistAmortizacion: 1,
      tasaInteres: 5,
      cantidadCtas: 12,
      moneda: "ARS",
      fechaOtorgamiento: new Date().toISOString().split('T')[0],
      fec1erVto: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    }
  });

  const currency = watch('moneda');

  const { data: borrowers } = useQuery({
    queryKey: ['borrowers'],
    queryFn: () => getBorrowers(),
  });

  const handleBorrowerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dni = e.target.value;
    setSelectedBorrowerId(dni);
    
    if (dni) {
      const borrower = borrowers?.find(b => b.dni.toString() === dni);
      if (borrower) {
        setValue('dniPrestatario', borrower.dni.toString());
        setValue('nombrePrestatario', `${borrower.nombre} ${borrower.apellido}`);
      }
    } else {
      setValue('dniPrestatario', '');
      setValue('nombrePrestatario', '');
    }
  };

  const simulateMutation = useMutation({
    mutationFn: simulateLoan,
    onSuccess: (data) => setSimulation(data),
  });

  const createMutation = useMutation({
    mutationFn: createLoan,
    onSuccess: (data: any) => {
      if (data && data.idPrestamo && alias.trim()) {
        setAlias(data.idPrestamo, alias.trim());
      }
      addToast("Préstamo creado exitosamente!", 'success');
      setSimulation(null);
      reset();
      setAliasInput('');
      setSelectedBorrowerId("");
      setIsConfirmationOpen(false);
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      navigate('/loans');
    },
    onError: (error: any) => {
        addToast(error.response?.data?.message || "Error al crear préstamo", 'error');
        console.error(error);
        setIsConfirmationOpen(false);
    }
  });

  const onSimulate = async () => {
    const data = getValues();
    // Validate partial data for simulation
    if (!data.montoOtorgado || !data.cantidadCtas || !data.tasaInteres) return;

    simulateMutation.mutate({
      montoPrestamo: Number(data.montoOtorgado),
      cantidadCuotas: Number(data.cantidadCtas),
      interesMensual: Number(data.tasaInteres),
      moneda: data.moneda,
      fechaInicio: new Date(data.fechaOtorgamiento).toISOString(),
      idSistAmortizacion: Number(data.idSistAmortizacion)
    });
  };

  const onSubmit = (data: LoanFormData) => {
    setPendingData(data);
    setIsConfirmationOpen(true);
  };

  const handleConfirmCreate = () => {
    if (!pendingData) return;
    
    createMutation.mutate({
        ...pendingData,
        idEstado: LoanStatus.Active, // Activo default
        dniPrestatario: Number(pendingData.dniPrestatario),
        nombrePrestatario: pendingData.nombrePrestatario,
        montoOtorgado: Number(pendingData.montoOtorgado),
        cantidadCtas: Number(pendingData.cantidadCtas),
        tasaInteres: Number(pendingData.tasaInteres),
        moneda: pendingData.moneda,
        idSistAmortizacion: Number(pendingData.idSistAmortizacion),
        fechaOtorgamiento: new Date(pendingData.fechaOtorgamiento).toISOString(),
        fec1erVto: new Date(pendingData.fec1erVto).toISOString(),
    });
  };

  const totalInteres = simulation?.detalleCuotas.reduce((acc, curr) => acc + curr.interes, 0) || 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Form */}
      <div className="glass-panel p-6">
        <h2 className="mb-6 text-xl font-bold text-main">Nuevo Préstamo</h2>
        
        <div className="mb-6 p-4 bg-surfaceHighlight/50 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-muted flex items-center gap-2">
              <User className="h-4 w-4 text-primary-500" />
              Seleccionar Prestatario *
            </label>
            <button 
              type="button"
              onClick={() => navigate('/borrowers/create')}
              className="text-xs text-primary-500 hover:text-primary-400 font-medium hover:underline"
            >
              + Crear Nuevo Cliente
            </button>
          </div>
          <div className="relative">
            <select
              value={selectedBorrowerId}
              onChange={handleBorrowerSelect}
              className={`block w-full rounded-xl border bg-surface px-4 py-3 text-main focus:ring-1 transition-all duration-200 [&>option]:bg-surface ${errors.dniPrestatario ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary-500 focus:ring-primary-500'}`}
            >
              <option value="">-- Seleccione un Prestatario --</option>
              {borrowers?.map((borrower) => (
                <option key={borrower.dni} value={borrower.dni}>
                  {borrower.apellido}, {borrower.nombre} (DNI: {borrower.dni})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
              <Search className="h-4 w-4" />
            </div>
          </div>
          {errors.dniPrestatario && !selectedBorrowerId && (
             <p className="mt-1 text-xs text-red-400">Debe seleccionar un prestatario</p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted">DNI Prestatario</label>
            <input
              {...register('dniPrestatario')}
              className="mt-1 block w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-main placeholder-muted opacity-60 cursor-not-allowed"
              placeholder="Seleccione un prestatario arriba"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted">Nombre Prestatario</label>
            <input
              {...register('nombrePrestatario')}
              className="mt-1 block w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-main placeholder-muted opacity-60 cursor-not-allowed"
              placeholder="Seleccione un prestatario arriba"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted">Alias (Opcional)</label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAliasInput(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-main placeholder-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200"
              placeholder="Ej. Préstamo Auto, Hipoteca Casa..."
            />
            <p className="mt-1 text-xs text-muted">Nombre corto para identificar este préstamo fácilmente (solo visible para ti).</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-muted">Moneda</label>
            <select
              {...register('moneda')}
              className="mt-1 block w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-main focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200 [&>option]:bg-surface"
            >
              <option value="ARS">Peso Argentino (ARS)</option>
              <option value="USD">Dólar Estadounidense (USD)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted">Monto ($)</label>
              <input
                type="number"
                {...register('montoOtorgado', { valueAsNumber: true })}
                className={`mt-1 block w-full rounded-xl border bg-surface/50 px-4 py-3 text-main placeholder-muted focus:ring-1 transition-all duration-200 ${errors.montoOtorgado ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary-500 focus:ring-primary-500'}`}
              />
              {errors.montoOtorgado && <p className="mt-1 text-xs text-red-400">{errors.montoOtorgado.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted">Tasa Interés Mensual (%)</label>
              <input
                type="number"
                step="0.1"
                {...register('tasaInteres', { valueAsNumber: true })}
                className={`mt-1 block w-full rounded-xl border bg-surface/50 px-4 py-3 text-main placeholder-muted focus:ring-1 transition-all duration-200 ${errors.tasaInteres ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary-500 focus:ring-primary-500'}`}
              />
              {errors.tasaInteres && <p className="mt-1 text-xs text-red-400">{errors.tasaInteres.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted">Cuotas</label>
              <input
                type="number"
                {...register('cantidadCtas', { valueAsNumber: true })}
                className={`mt-1 block w-full rounded-xl border bg-surface/50 px-4 py-3 text-main placeholder-muted focus:ring-1 transition-all duration-200 ${errors.cantidadCtas ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary-500 focus:ring-primary-500'}`}
              />
              {errors.cantidadCtas && <p className="mt-1 text-xs text-red-400">{errors.cantidadCtas.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted">Sistema</label>
              <select
                {...register('idSistAmortizacion', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-main focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200 [&>option]:bg-surface"
              >
                <option value={1}>Directo (Tasa Plana)</option>
                <option value={2}>Francés (Cuota Fija)</option>
                <option value={3}>Alemán (Amort. Fija)</option>
                <option value={4}>Americano (Solo Interés)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted">Fecha Otorgamiento</label>
              <input
                type="date"
                {...register('fechaOtorgamiento')}
                className={`mt-1 block w-full rounded-xl border bg-surface/50 px-4 py-3 text-main placeholder-muted focus:ring-1 transition-all duration-200 ${errors.fechaOtorgamiento ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary-500 focus:ring-primary-500'}`}
              />
              {errors.fechaOtorgamiento && <p className="mt-1 text-xs text-red-400">{errors.fechaOtorgamiento.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted">Primer Vencimiento</label>
              <input
                type="date"
                {...register('fec1erVto')}
                className={`mt-1 block w-full rounded-xl border bg-surface/50 px-4 py-3 text-main placeholder-muted focus:ring-1 transition-all duration-200 ${errors.fec1erVto ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary-500 focus:ring-primary-500'}`}
              />
              {errors.fec1erVto && <p className="mt-1 text-xs text-red-400">{errors.fec1erVto.message}</p>}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onSimulate}
              disabled={simulateMutation.isPending}
              className="flex flex-1 items-center justify-center rounded-xl border border-border bg-surfaceHighlight px-4 py-3 text-sm font-medium text-main hover:bg-border transition-all duration-200 disabled:opacity-50"
            >
              {simulateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
              Simular
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-accent-pink px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all duration-200 hover:shadow-primary-500/40 hover:scale-[1.02] disabled:opacity-50"
            >
              {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Crear Préstamo
            </button>
          </div>
        </form>
      </div>

      {/* Simulation Results */}
      <div className="glass-panel p-6">
        <h3 className="mb-4 text-lg font-bold text-main">Proyección de Pagos</h3>
        {simulation ? (
          <div className="flex h-full flex-col">
            <div className="mb-4 grid grid-cols-2 gap-4 rounded-xl bg-surfaceHighlight/30 border border-border p-4">
              <div>
                <span className="text-xs text-muted">Total a Pagar</span>
                <p className="text-lg font-bold text-main">{formatCurrency(simulation.totalAPagar, currency)}</p>
              </div>
              <div>
                <span className="text-xs text-muted">Total Intereses</span>
                <p className="text-lg font-bold text-primary-400">{formatCurrency(totalInteres, currency)}</p>
              </div>
            </div>
            <div className="flex-1 overflow-auto max-h-[400px] custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="bg-surfaceHighlight text-muted sticky top-0 backdrop-blur-sm">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Vencimiento</th>
                    <th className="px-3 py-2">Cuota</th>
                    <th className="px-3 py-2">Interés</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {simulation.detalleCuotas.map((cuota) => (
                    <tr key={cuota.numeroCuota} className="hover:bg-surfaceHighlight/30 transition-colors">
                      <td className="px-3 py-2 text-muted">{cuota.numeroCuota}</td>
                      <td className="px-3 py-2 text-muted">{formatDate(cuota.fechaVencimiento)}</td>
                      <td className="px-3 py-2 font-medium text-emerald-400">{formatCurrency(cuota.monto, currency)}</td>
                      <td className="px-3 py-2 text-muted">{formatCurrency(cuota.interes, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-muted">
            <div className="text-center">
              <Calculator className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-2">Simula el préstamo para ver el detalle</p>
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirmCreate}
        title="Confirmar Creación de Préstamo"
        message={`¿Estás seguro que deseas crear este préstamo para ${pendingData?.nombrePrestatario} por un monto de ${formatCurrency(pendingData?.montoOtorgado || 0, pendingData?.moneda)}?`}
        confirmText="Crear Préstamo"
        cancelText="Cancelar"
        isLoading={createMutation.isPending}
        variant="primary"
      />
    </div>
  );
}
