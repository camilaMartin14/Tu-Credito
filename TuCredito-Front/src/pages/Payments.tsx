import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPayments, getPaymentsByFilter, updatePaymentStatus } from '../services/paymentService';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Download, AlertCircle, CheckCircle2, X, Ban, Plus, Info, FileSpreadsheet } from 'lucide-react';
import { PaymentMethod, getPaymentMethodLabel } from '../types/enums';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/ui/StatusBadge';
import { exportToPDF } from '../utils/pdfGenerator';
import { exportToExcel } from '../utils/excelGenerator';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { useToast } from '../context/ToastContext';

import { PaymentModal } from '../components/payments/PaymentModal';
import { NewPaymentModal } from '../components/payments/NewPaymentModal';
import { Cuota } from '../types';

export function Payments() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id?: number; newStatus?: string }>({ isOpen: false });
  const [isNewPaymentModalOpen, setIsNewPaymentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Cuota | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ARS');

  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['payments', searchTerm, selectedMonth],
    queryFn: () => {
      if (searchTerm || selectedMonth) {
        return getPaymentsByFilter({ 
          nombre: searchTerm || undefined, 
          mes: selectedMonth 
        });
      }
      return getPayments();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: string }) => 
      updatePaymentStatus(id, estado),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      addToast(`Estado del pago actualizado a ${variables.estado}`, 'success');
      setConfirmModal({ isOpen: false });
    },
    onError: () => {
      addToast('Error al actualizar el estado del pago', 'error');
    }
  });

  const handleUpdateStatus = (id: number, newStatus: string) => {
    setConfirmModal({ isOpen: true, id, newStatus });
  };

  const onConfirmUpdate = () => {
    if (confirmModal.id && confirmModal.newStatus) {
      updateStatusMutation.mutate({ id: confirmModal.id, estado: confirmModal.newStatus });
    }
  };

  const handleExport = () => {
    if (!payments) return;

    const headers = ['ID', 'Cuota', 'Monto', 'Fecha', 'Medio', 'Estado'];
    const data = payments.map(payment => [
      payment.idPago.toString(),
      payment.nroCuota.toString(),
      formatCurrency(payment.monto),
      payment.fecPago ? new Date(payment.fecPago).toLocaleDateString() : '-',
      getPaymentMethodLabel(payment.medioPago),
      payment.estado
    ]);

    exportToPDF('Reporte de Pagos', headers, data, 'pagos');
  };

  const handleExportExcel = () => {
    if (!payments) return;
    
    const data = payments.map(payment => ({
      ID: payment.idPago,
      Cuota: payment.nroCuota,
      Monto: payment.monto,
      Fecha: payment.fecPago ? new Date(payment.fecPago).toLocaleDateString() : '-',
      Medio: getPaymentMethodLabel(payment.medioPago),
      Estado: payment.estado
    }));

    exportToExcel(data, 'Reporte_Pagos', 'Pagos');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p>Error al cargar los pagos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-main">Pagos</h1>
          <p className="text-muted">Historial de transacciones y pagos recibidos</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsNewPaymentModalOpen(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary-500/20"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Registrar Pago</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600/10 hover:bg-green-600/20 text-green-600 rounded-lg transition-colors border border-green-600/20"
            title="Exportar a Excel"
          >
            <FileSpreadsheet className="h-5 w-5" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-surfaceHighlight hover:bg-border text-main px-4 py-2 rounded-lg transition-colors border border-border"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {searchParams.get('view') === 'profitability' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Flujo de Rentabilidad</h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-200 mt-1">
              Este historial de pagos es la base de tu rentabilidad. Cada pago incluye una porción de intereses que, sumada, genera el margen de ganancia global de tu negocio.
            </p>
          </div>
        </div>
      )}

      <div className="glass-panel rounded-xl overflow-hidden border border-border">
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Buscar por nombre o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface/50 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-main placeholder-muted focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors
                ${showFilters ? 'bg-primary-500/10 border-primary-500 text-primary-500' : 'border-border text-muted hover:bg-surfaceHighlight'}`}
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 animate-in slide-in-from-top-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted">Mes</label>
                <select
                  value={selectedMonth || ''}
                  onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-surface/50 border border-border rounded-lg px-3 py-2 text-sm text-main focus:outline-none focus:border-primary-500"
                >
                  <option value="">Todos</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('es-ES', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedMonth(undefined);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surfaceHighlight text-muted">
              <tr>
                <th className="px-6 py-3 font-medium">ID Pago</th>
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Cuota</th>
                <th className="px-6 py-3 font-medium">Monto</th>
                <th className="px-6 py-3 font-medium">Fecha</th>
                <th className="px-6 py-3 font-medium">Medio de Pago</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments?.map((payment) => (
                <tr key={payment.idPago} className="hover:bg-surfaceHighlight/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-main">#{payment.idPago}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => payment.dniCliente && navigate(`/borrowers/${payment.dniCliente}`)}
                      className="text-primary-400 hover:text-primary-300 font-medium hover:underline text-left"
                      disabled={!payment.dniCliente}
                    >
                      {payment.nombreCliente && payment.apellidoCliente 
                        ? `${payment.nombreCliente} ${payment.apellidoCliente}`
                        : 'N/A'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {payment.nroCuota.toString().padStart(2, '0')}/{payment.cantidadTotalCuotas || '-'}
                  </td>
                  <td className="px-6 py-4 text-main font-semibold">{formatCurrency(payment.monto || 0)}</td>
                  <td className="px-6 py-4 text-muted">
                    {formatDate(payment.fecPago)}
                  </td>
                  <td className="px-6 py-4 text-muted">{getPaymentMethodLabel(payment.medioPago as PaymentMethod)}</td>
                  <td className="px-6 py-4">
                     <StatusBadge variant={
                        payment.estado === 'Aprobado' || payment.estado === 'Registrado' ? 'success' : 
                        payment.estado === 'Anulado' ? 'error' : 
                        payment.estado === 'Pendiente' ? 'warning' : 'default'
                     }>
                        {payment.estado === 'Anulado' ? <Ban className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />} 
                        {payment.estado}
                     </StatusBadge>
                  </td>
                  <td className="px-6 py-4">
                    {payment.estado !== 'Anulado' && (
                      <button
                        onClick={() => handleUpdateStatus(payment.idPago, 'Anulado')}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1.5 rounded-lg transition-colors"
                        title="Anular Pago"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={onConfirmUpdate}
        title="Actualizar Estado de Pago"
        message={`¿Estás seguro de que deseas cambiar el estado a "${confirmModal.newStatus}"?`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant="warning"
        isLoading={updateStatusMutation.isPending}
      />

      <NewPaymentModal
        isOpen={isNewPaymentModalOpen}
        onClose={() => setIsNewPaymentModalOpen(false)}
        onInstallmentSelect={(installment, currency) => {
          setSelectedInstallment(installment);
          setSelectedCurrency(currency);
          setIsNewPaymentModalOpen(false);
          setIsPaymentModalOpen(true);
        }}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedInstallment(null);
        }}
        installment={selectedInstallment}
        currency={selectedCurrency}
      />
    </div>
  );
}
