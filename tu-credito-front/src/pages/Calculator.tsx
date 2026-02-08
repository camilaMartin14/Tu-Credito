import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { simulateLoan } from '../services/loanService';
import { SimulacionPrestamoEntryDTO } from '../types';
import { Calculator as CalculatorIcon, DollarSign, Calendar, Percent } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export function Calculator() {
  const { register, handleSubmit } = useForm<SimulacionPrestamoEntryDTO>();
  const [result, setResult] = useState<any>(null);
  const { addToast } = useToast();

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

  const onSubmit = (data: SimulacionPrestamoEntryDTO) => {
    // Convert strings to numbers
    const payload = {
        montoPrestamo: Number(data.montoPrestamo),
        interesMensual: Number(data.interesMensual),
        cantidadCuotas: Number(data.cantidadCuotas),
        fechaInicio: new Date().toISOString()
    };
    mutation.mutate(payload);
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
                        ${(result.detalleCuotas.reduce((acc: number, curr: any) => acc + curr.monto, 0) / result.detalleCuotas.length).toFixed(2)}
                     </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surfaceHighlight/50 border border-border">
                     <p className="text-xs text-muted mb-1">Total Intereses</p>
                     <p className="text-lg font-bold text-accent-pink">
                        ${result.detalleCuotas.reduce((acc: number, curr: any) => acc + curr.interes, 0).toFixed(2)}
                     </p>
                  </div>
                   <div className="p-4 rounded-xl bg-surfaceHighlight/50 border border-border">
                     <p className="text-xs text-muted mb-1">Total a Pagar</p>
                     <p className="text-lg font-bold text-main">
                        ${result.detalleCuotas.reduce((acc: number, curr: any) => acc + curr.monto, 0).toFixed(2)}
                     </p>
                  </div>
               </div>

               <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-surfaceHighlight text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">N°</th>
                      <th className="px-4 py-3 font-medium">Cuota</th>
                      <th className="px-4 py-3 font-medium">Interés</th>
                      <th className="px-4 py-3 font-medium">Amortización</th>
                      <th className="px-4 py-3 font-medium">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {result.detalleCuotas.map((cuota: any, index: number) => (
                      <tr key={index} className="hover:bg-surfaceHighlight/30">
                        <td className="px-4 py-2.5 text-muted">{cuota.numeroCuota}</td>
                        <td className="px-4 py-2.5 font-medium text-main">${cuota.monto.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-accent-pink">${cuota.interes.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-green-400">${cuota.capital.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-muted">${Math.abs(cuota.saldoRestante).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
    </div>
  );
}
