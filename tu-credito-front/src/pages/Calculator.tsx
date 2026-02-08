import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { simulateLoan, createLoan } from '../services/loanService';
import { getBorrowers } from '../services/borrowerService';
import { SimulacionPrestamoEntryDTO } from '../types';
import { Calculator as CalculatorIcon, DollarSign, Calendar, Percent, User, X, Check, Search, CalendarDays } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { LoanStatus } from '../types/enums';

export function Calculator() {
  const { register, handleSubmit, getValues } = useForm<SimulacionPrestamoEntryDTO>();
  const [result, setResult] = useState<any>(null);
  const [simulationParams, setSimulationParams] = useState<SimulacionPrestamoEntryDTO | null>(null);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string>("");
  const [creationData, setCreationData] = useState({
    dniPrestatario: '',
    nombrePrestatario: '',
    fechaOtorgamiento: new Date().toISOString().split('T')[0],
    fec1erVto: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
  });

  const { data: borrowers } = useQuery({
    queryKey: ['borrowers'],
    queryFn: () => getBorrowers(),
  });

  const mutation = useMutation({
    mutationFn: simulateLoan,
    onSuccess: (data) => {
      setResult(data);
      addToast('Simulación calculada correctamente', 'success');
    },
    onError: (error: any) => {
      addToast(error.response?.data?.message || 'Error al calcular la simulación', 'error');
    }
  });

  const createLoanMutation = useMutation({
    mutationFn: createLoan,
    onSuccess: () => {
      addToast('Préstamo creado exitosamente', 'success');
      setIsModalOpen(false);
      setResult(null);
      setSimulationParams(null);
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
    onError: (error: any) => {
      addToast(error.response?.data?.message || 'Error al crear el préstamo', 'error');
    }
  });

  const onSubmit = (data: SimulacionPrestamoEntryDTO) => {
    // Convert strings to numbers
    const payload = {
        montoPrestamo: Number(data.montoPrestamo),
        interesMensual: Number(data.interesMensual),
        cantidadCuotas: Number(data.cantidadCuotas),
        fechaInicio: new Date().toISOString()
    };
    setSimulationParams(payload);
    mutation.mutate(payload);
  };

  const handleCreateLoan = () => {
    if (!simulationParams) return;
    
    createLoanMutation.mutate({
      dniPrestatario: Number(creationData.dniPrestatario),
      nombrePrestatario: creationData.nombrePrestatario,
      montoOtorgado: simulationParams.montoPrestamo,
      cantidadCtas: simulationParams.cantidadCuotas,
      tasaInteres: simulationParams.interesMensual,
      idEstado: LoanStatus.Active,
      fechaOtorgamiento: new Date(creationData.fechaOtorgamiento).toISOString(),
      fec1erVto: new Date(creationData.fec1erVto).toISOString(),
      idSistAmortizacion: 1, // Francés por defecto
    });
  };

  const handleBorrowerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dni = e.target.value;
    setSelectedBorrowerId(dni);
    
    if (dni) {
      const borrower = borrowers?.find(b => b.dni.toString() === dni);
      if (borrower) {
        setCreationData(prev => ({
          ...prev,
          dniPrestatario: borrower.dni.toString(),
          nombrePrestatario: `${borrower.nombre} ${borrower.apellido}`
        }));
      }
    } else {
        setCreationData(prev => ({
          ...prev,
          dniPrestatario: '',
          nombrePrestatario: ''
        }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-main mb-2">Simulador de Préstamos</h1>
        <p className="text-muted">Calcula las cuotas y el plan de pagos estimado</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="md:col-span-1 glass-panel p-6 rounded-2xl border border-border h-fit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Monto del Préstamo</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="number"
                  {...register('montoPrestamo', { required: true, min: 1 })}
                  className="w-full bg-surface/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-main placeholder-muted focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Tasa Mensual (%)</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="number"
                  step="0.1"
                  {...register('interesMensual', { required: true, min: 0 })}
                  className="w-full bg-surface/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-main placeholder-muted focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="0.0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Cantidad de Cuotas</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="number"
                  {...register('cantidadCuotas', { required: true, min: 1 })}
                  className="w-full bg-surface/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-main placeholder-muted focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="12"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-primary-500/20 mt-4 flex items-center justify-center gap-2"
            >
              {mutation.isPending ? 'Calculando...' : (
                <>
                  <CalculatorIcon className="h-5 w-5" />
                  Calcular
                </>
              )}
            </button>
          </form>
        </div>

        {/* Resultados */}
        <div className="md:col-span-2 space-y-6">
          {result ? (
            <div className="glass-panel p-6 rounded-2xl border border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-surfaceHighlight/50 border border-border">
                     <p className="text-xs text-muted mb-1">Cuota Promedio</p>
                     <p className="text-lg font-bold text-primary-400">
                        {formatCurrency(result.detalleCuotas.reduce((acc: number, curr: any) => acc + curr.monto, 0) / result.detalleCuotas.length)}
                     </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surfaceHighlight/50 border border-border">
                     <p className="text-xs text-muted mb-1">Total Intereses</p>
                     <p className="text-lg font-bold text-accent-pink">
                        {formatCurrency(result.detalleCuotas.reduce((acc: number, curr: any) => acc + curr.interes, 0))}
                     </p>
                  </div>
                   <div className="p-4 rounded-xl bg-surfaceHighlight/50 border border-border">
                     <p className="text-xs text-muted mb-1">Total a Pagar</p>
                     <p className="text-lg font-bold text-main">
                        {formatCurrency(result.detalleCuotas.reduce((acc: number, curr: any) => acc + curr.monto, 0))}
                     </p>
                  </div>
               </div>

               <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-surfaceHighlight text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">N°</th>
                      <th className="px-4 py-3 font-medium">Cuota</th>
                      <th className="px-4 py-3 font-medium">Vencimiento</th>
                      <th className="px-4 py-3 font-medium">Interés</th>
                      <th className="px-4 py-3 font-medium">Amortización</th>
                      <th className="px-4 py-3 font-medium">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {result.detalleCuotas.map((cuota: any, index: number) => (
                      <tr key={index} className="hover:bg-surfaceHighlight/30">
                        <td className="px-4 py-2.5 text-muted">{cuota.numeroCuota}</td>
                        <td className="px-4 py-2.5 font-medium text-main">{formatCurrency(cuota.monto)}</td>
                        <td className="px-4 py-2.5 text-muted">{formatDate(cuota.fechaVencimiento)}</td>
                        <td className="px-4 py-2.5 text-accent-pink">{formatCurrency(cuota.interes)}</td>
                        <td className="px-4 py-2.5 text-green-400">{formatCurrency(cuota.capital)}</td>
                        <td className="px-4 py-2.5 text-muted">{formatCurrency(Math.abs(cuota.saldoRestante))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               </div>

               <div className="mt-6 flex justify-end">
                 <button
                   onClick={() => setIsModalOpen(true)}
                   className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2"
                 >
                   <Check className="h-5 w-5" />
                   Crear Préstamo
                 </button>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 glass-panel rounded-2xl border border-border border-dashed text-muted">
              <CalculatorIcon className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg">Ingresa los datos para ver la proyección</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-background border border-border rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-main">Confirmar Nuevo Préstamo</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-main">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
                <div className="p-4 bg-surfaceHighlight/50 rounded-xl border border-border">
                    <label className="block text-sm font-medium text-muted mb-2 flex items-center gap-2">
                        <User className="h-4 w-4 text-primary-500" />
                        Seleccionar Prestatario
                    </label>
                    <div className="relative">
                        <select
                            value={selectedBorrowerId}
                            onChange={handleBorrowerSelect}
                            className="block w-full rounded-xl border border-border bg-surface px-4 py-3 text-main focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">DNI Prestatario</label>
                        <input
                            value={creationData.dniPrestatario}
                            onChange={(e) => setCreationData(prev => ({ ...prev, dniPrestatario: e.target.value }))}
                            className={`w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-main ${selectedBorrowerId ? 'opacity-75' : ''}`}
                            placeholder="Ingrese DNI"
                            readOnly={!!selectedBorrowerId}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Nombre Completo</label>
                        <input
                            value={creationData.nombrePrestatario}
                            onChange={(e) => setCreationData(prev => ({ ...prev, nombrePrestatario: e.target.value }))}
                            className={`w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-main ${selectedBorrowerId ? 'opacity-75' : ''}`}
                            placeholder="Ingrese Nombre"
                            readOnly={!!selectedBorrowerId}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Fecha Otorgamiento</label>
                        <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                            <input
                                type="date"
                                value={creationData.fechaOtorgamiento}
                                onChange={(e) => setCreationData(prev => ({ ...prev, fechaOtorgamiento: e.target.value }))}
                                className="w-full bg-surface/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-main"
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-muted mb-1">Primer Vencimiento</label>
                        <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                            <input
                                type="date"
                                value={creationData.fec1erVto}
                                onChange={(e) => setCreationData(prev => ({ ...prev, fec1erVto: e.target.value }))}
                                className="w-full bg-surface/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-main"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                    <h3 className="font-semibold text-primary-400 mb-2">Resumen del Préstamo</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-muted block">Monto</span>
                            <span className="text-main font-medium">{formatCurrency(simulationParams?.montoPrestamo || 0)}</span>
                        </div>
                         <div>
                            <span className="text-muted block">Tasa</span>
                            <span className="text-main font-medium">{simulationParams?.interesMensual}%</span>
                        </div>
                         <div>
                            <span className="text-muted block">Cuotas</span>
                            <span className="text-main font-medium">{simulationParams?.cantidadCuotas}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-border bg-surfaceHighlight/30 flex justify-end gap-3">
                <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-main hover:bg-surfaceHighlight transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleCreateLoan}
                    disabled={createLoanMutation.isPending || !creationData.dniPrestatario || !creationData.nombrePrestatario}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {createLoanMutation.isPending ? 'Procesando...' : 'Confirmar Préstamo'}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
