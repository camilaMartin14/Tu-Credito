import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPayment, registerAdvancePayment } from '../../services/paymentService';
import { Cuota, PagoInputDTO } from '../../types';
import { useToast } from '../../context/ToastContext';
import { X, DollarSign, Calendar, CreditCard, Percent, Save, Zap } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

import { PaymentMethod, getPaymentMethodLabel } from '../../types/enums';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  installment: Cuota | null;
  isAdvance?: boolean;
}

export function PaymentModal({ isOpen, onClose, installment, isAdvance = false }: PaymentModalProps) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState<Partial<PagoInputDTO>>({
    monto: 0,
    fechaPago: new Date().toISOString().split('T')[0],
    idMedioPago: PaymentMethod.Transfer,
    descuento: 0,
    recargo: 0
  });

  useEffect(() => {
    if (installment) {
      setFormData({
        idCuota: installment.idCuota,
        monto: installment.saldoPendiente || installment.monto,
        fechaPago: new Date().toISOString().split('T')[0],
        idMedioPago: PaymentMethod.Transfer,
        descuento: 0,
        recargo: 0
      });
    }
  }, [installment]);

  const mutation = useMutation({
    mutationFn: (data: PagoInputDTO) => isAdvance ? registerAdvancePayment(data) : createPayment(data),
    onSuccess: () => {
      addToast(isAdvance ? 'Pago anticipado registrado correctamente' : 'Pago registrado exitosamente', 'success');
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      queryClient.invalidateQueries({ queryKey: ['loanSummary'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      onClose();
    },
    onError: (error: any) => {
      addToast(error.response?.data?.message || 'Error al registrar el pago', 'error');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!installment || !formData.monto) return;

    mutation.mutate({
      idCuota: installment.idCuota,
      monto: Number(formData.monto),
      fechaPago: new Date(formData.fechaPago!).toISOString(),
      idMedioPago: Number(formData.idMedioPago),
      descuento: Number(formData.descuento || 0),
      recargo: Number(formData.recargo || 0)
    } as PagoInputDTO);
  };

  if (!isOpen || !installment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            {isAdvance && <Zap className="h-5 w-5 text-yellow-500" />}
            <h2 className="text-lg font-semibold text-main">
              {isAdvance ? 'Pago Anticipado' : 'Registrar Pago'} - Cuota #{installment.nroCuota}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-main transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isAdvance && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-500 mb-4">
              Estás adelantando la última cuota pendiente. Esto ayuda a reducir el plazo de tu préstamo.
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Monto a Pagar</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="number"
                step="0.01"
                required
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: Number(e.target.value) })}
                className="w-full bg-surfaceHighlight border border-border rounded-lg pl-10 pr-4 py-2 text-main focus:border-primary-500 focus:outline-none"
              />
            </div>
            <p className="text-xs text-muted">
              Saldo pendiente: {formatCurrency(installment.saldoPendiente || installment.monto)}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Fecha de Pago</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="date"
                required
                value={formData.fechaPago}
                onChange={(e) => setFormData({ ...formData, fechaPago: e.target.value })}
                className="w-full bg-surfaceHighlight border border-border rounded-lg pl-10 pr-4 py-2 text-main focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Medio de Pago</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <select
                value={formData.idMedioPago}
                onChange={(e) => setFormData({ ...formData, idMedioPago: Number(e.target.value) })}
                className="w-full bg-surfaceHighlight border border-border rounded-lg pl-10 pr-4 py-2 text-main focus:border-primary-500 focus:outline-none appearance-none"
              >
                <option value={PaymentMethod.Transfer}>{getPaymentMethodLabel(PaymentMethod.Transfer)}</option>
                <option value={PaymentMethod.Cash}>{getPaymentMethodLabel(PaymentMethod.Cash)}</option>
                <option value={PaymentMethod.CashUSD}>{getPaymentMethodLabel(PaymentMethod.CashUSD)}</option>
                <option value={PaymentMethod.TransferUSD}>{getPaymentMethodLabel(PaymentMethod.TransferUSD)}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Descuento</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.descuento}
                  onChange={(e) => setFormData({ ...formData, descuento: Number(e.target.value) })}
                  className="w-full bg-surfaceHighlight border border-border rounded-lg pl-10 pr-4 py-2 text-main focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Recargo</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.recargo}
                  onChange={(e) => setFormData({ ...formData, recargo: Number(e.target.value) })}
                  className="w-full bg-surfaceHighlight border border-border rounded-lg pl-10 pr-4 py-2 text-main focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted hover:text-main transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {mutation.isPending ? 'Registrando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
