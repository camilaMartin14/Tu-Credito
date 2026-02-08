import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { simulateLoan, createLoan } from '../../services/loanService';
import { getBorrowers } from '../../services/borrowerService';
import { SimulacionPrestamoOutputDTO, PrestatarioDTO } from '../../types';
import { Loader2, Calculator, CheckCircle, User, Search } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

import { useToast } from '../../context/ToastContext';

import { LoanStatus } from '../../types/enums';

const loanSchema = z.object({
  dniPrestatario: z.string().min(7, "DNI inválido"),
  nombrePrestatario: z.string().min(3, "El nombre es obligatorio"),
  montoOtorgado: z.number().min(1000, "El monto mínimo es 1000"),
  cantidadCtas: z.number().min(1, "Mínimo 1 cuota"),
  tasaInteres: z.number().min(0, "La tasa no puede ser negativa"),
  idSistAmortizacion: z.number(),
  fechaOtorgamiento: z.string(), // ISO date
  fec1erVto: z.string(), // ISO date
});

type LoanFormData = z.infer<typeof loanSchema>;

export function LoanForm() {
  const { addToast } = useToast();
  const [simulation, setSimulation] = useState<SimulacionPrestamoOutputDTO | null>(null);
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string>("");
  
  const { register, handleSubmit, formState: { errors }, getValues, setValue, watch } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      idSistAmortizacion: 1,
      tasaInteres: 5,
      cantidadCtas: 12,
      fechaOtorgamiento: new Date().toISOString().split('T')[0],
      fec1erVto: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    }
  });

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
    onSuccess: () => {
      addToast("Préstamo creado exitosamente!", 'success');
      setSimulation(null);
      // Reset form or redirect
    },
    onError: (error: any) => {
        addToast(error.response?.data?.message || "Error al crear préstamo", 'error');
        console.error(error);
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
      fechaInicio: new Date(data.fechaOtorgamiento).toISOString(),
    });
  };

  const onSubmit = (data: LoanFormData) => {
    if (!simulation) {
        addToast("Debes simular el préstamo primero", 'warning');
        return;
    }
    createMutation.mutate({
        ...data,
        idEstado: LoanStatus.Active, // Activo default
        dniPrestatario: Number(data.dniPrestatario),
        nombrePrestatario: data.nombrePrestatario,
        montoOtorgado: Number(data.montoOtorgado),
        cantidadCtas: Number(data.cantidadCtas),
        tasaInteres: Number(data.tasaInteres),
        idSistAmortizacion: Number(data.idSistAmortizacion),
        fechaOtorgamiento: new Date(data.fechaOtorgamiento).toISOString(),
        fec1erVto: new Date(data.fec1erVto).toISOString(),
    });
  };

  const totalInteres = simulation?.detalleCuotas.reduce((acc, curr) => acc + curr.interes, 0) || 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Form */}
      <div className="glass-panel p-6">
        <h2 className="mb-6 text-xl font-bold text-main">Nuevo Préstamo</h2>
        
        <div className="mb-6 p-4 bg-surfaceHighlight/50 rounded-xl border border-border">
          <label className="block text-sm font-medium text-muted mb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-primary-500" />
            Seleccionar Prestatario Existente (Opcional)
          </label>
          <div className="relative">
            <select
              value={selectedBorrowerId}
              onChange={handleBorrowerSelect}
              className="block w-full rounded-xl border border-border bg-surface px-4 py-3 text-main focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200 [&>option]:bg-surface"
            >
              <option value="">-- Nuevo Prestatario / Ingreso Manual --</option>
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
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted">DNI Prestatario</label>
            <input
              {...register('dniPrestatario')}
              className={`mt-1 block w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-main placeholder-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200 ${selectedBorrowerId ? 'opacity-75' : ''}`}
              placeholder="Ingrese DNI"
              readOnly={!!selectedBorrowerId}
            />
            {errors.dniPrestatario && <p className="mt-1 text-xs text-red-400">{errors.dniPrestatario.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted">Nombre Prestatario</label>
            <input
              {...register('nombrePrestatario')}
              className={`mt-1 block w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-main placeholder-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200 ${selectedBorrowerId ? 'opacity-75' : ''}`}
              placeholder="Ingrese Nombre Completo"
              readOnly={!!selectedBorrowerId}
            />
            {errors.nombrePrestatario && <p className="mt-1 text-xs text-red-400">{errors.nombrePrestatario.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted">Monto ($)</label>
              <input
                type="number"
                {...register('montoOtorgado', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-main placeholder-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200"
              />
              {errors.montoOtorgado && <p className="mt-1 text-xs text-red-400">{errors.montoOtorgado.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted">Tasa Interés (%)</label>
              <input
                type="number"
                step="0.1"
                {...register('tasaInteres', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-main placeholder-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted">Cuotas</label>
              <input
                type="number"
                {...register('cantidadCtas', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-main placeholder-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted">Sistema</label>
              <select
                {...register('idSistAmortizacion', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-main focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200 [&>option]:bg-surface"
              >
                <option value={1}>Francés</option>
                <option value={2}>Alemán</option>
                <option value={3}>Americano</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted">Fecha Otorgamiento</label>
              <input
                type="date"
                {...register('fechaOtorgamiento')}
                className="mt-1 block w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-main placeholder-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted">Primer Vencimiento</label>
              <input
                type="date"
                {...register('fec1erVto')}
                className="mt-1 block w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-main placeholder-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200"
              />
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
              disabled={createMutation.isPending || !simulation}
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
        <h3 className="mb-4 text-lg font-bold text-white">Proyección de Pagos</h3>
        {simulation ? (
          <div className="flex h-full flex-col">
            <div className="mb-4 grid grid-cols-2 gap-4 rounded-xl bg-surface/50 border border-white/5 p-4">
              <div>
                <span className="text-xs text-gray-400">Total a Pagar</span>
                <p className="text-lg font-bold text-white">{formatCurrency(simulation.totalAPagar)}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Total Intereses</span>
                <p className="text-lg font-bold text-primary-400">{formatCurrency(totalInteres)}</p>
              </div>
            </div>
            <div className="flex-1 overflow-auto max-h-[400px] custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface/50 text-gray-400 sticky top-0 backdrop-blur-sm">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Vencimiento</th>
                    <th className="px-3 py-2">Cuota</th>
                    <th className="px-3 py-2">Interés</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {simulation.detalleCuotas.map((cuota) => (
                    <tr key={cuota.numeroCuota} className="hover:bg-white/5 transition-colors">
                      <td className="px-3 py-2 text-gray-300">{cuota.numeroCuota}</td>
                      <td className="px-3 py-2 text-gray-300">{formatDate(cuota.fechaVencimiento)}</td>
                      <td className="px-3 py-2 font-medium text-emerald-400">{formatCurrency(cuota.monto)}</td>
                      <td className="px-3 py-2 text-gray-500">{formatCurrency(cuota.interes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-gray-500">
            <div className="text-center">
              <Calculator className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-2">Simula el préstamo para ver el detalle</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
