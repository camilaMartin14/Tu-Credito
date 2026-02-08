import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLoanById, getLoanSummary } from '../services/loanService';
import { getInstallments } from '../services/installmentService';
import { ArrowLeft, Calendar, PieChart, AlertCircle, Clock, CreditCard } from 'lucide-react';
import { Cuota } from '../types';
import { LoanStatus, InstallmentStatus, getLoanStatusLabel, getInstallmentStatusLabel } from '../types/enums';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { PaymentModal } from '../components/payments/PaymentModal';
import { useToast } from '../context/ToastContext';

export function LoanDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const loanId = parseInt(id || '0');

  const [selectedInstallment, setSelectedInstallment] = useState<Cuota | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: loan, isLoading: isLoadingLoan } = useQuery({
    queryKey: ['loan', loanId],
    queryFn: () => getLoanById(loanId),
    enabled: !!loanId,
  });

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['loanSummary', loanId],
    queryFn: () => getLoanSummary(loanId),
    enabled: !!loanId,
  });

  const { data: installments, isLoading: isLoadingInstallments } = useQuery({
    queryKey: ['installments', loanId],
    queryFn: () => getInstallments({ idPrestamo: loanId }),
    enabled: !!loanId,
  });

  if (isLoadingLoan || isLoadingInstallments || isLoadingSummary) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p>Préstamo no encontrado</p>
        <button 
          onClick={() => navigate('/loans')}
          className="mt-4 px-4 py-2 bg-surfaceHighlight rounded-lg text-main hover:bg-surfaceHighlight/80 transition-colors"
        >
          Volver a Préstamos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/loans')}
            className="p-2 hover:bg-surfaceHighlight rounded-full transition-colors text-muted hover:text-main"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-main">Préstamo #{loan.idPrestamo}</h1>
            <p className="text-muted">Detalles y plan de cuotas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Loan Info Card */}
        <div className="glass-panel p-6 rounded-xl border border-border space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-main flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary-500" />
              Información General
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Cliente</span>
                <span className="text-main font-medium">{loan.nombrePrestatario}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Monto Otorgado</span>
                <span className="text-main font-medium">${loan.montoOtorgado.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tasa Interés</span>
                <span className="text-main font-medium">{loan.tasaInteres}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Fecha Otorgamiento</span>
                <span className="text-main font-medium">{new Date(loan.fechaOtorgamiento).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Estado</span>
                <StatusBadge variant={
                  loan.idEstado === LoanStatus.Active ? 'success' : 
                  loan.idEstado === LoanStatus.Finished ? 'default' : 
                  loan.idEstado === LoanStatus.Deleted ? 'error' : 'default'
                }>
                  {getLoanStatusLabel(loan.idEstado)}
                </StatusBadge>
              </div>
            </div>
          </div>

          {summary && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h2 className="text-lg font-semibold text-main flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-500" />
                Estadísticas
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Cuotas Originales</span>
                  <span className="text-main font-medium">{summary.cantidadCuotasOriginales}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Cuotas Pagadas</span>
                  <span className="text-main font-medium">{summary.cantidadCuotasEfectivas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Meses Activo</span>
                  <span className="text-main font-medium">{summary.mesesActivo}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Installments Table */}
        <div className="md:col-span-2 glass-panel rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-main flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-500" />
              Plan de Cuotas
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surfaceHighlight text-muted">
                <tr>
                  <th className="px-6 py-3 font-medium">#</th>
                  <th className="px-6 py-3 font-medium">Vencimiento</th>
                  <th className="px-6 py-3 font-medium">Monto</th>
                  <th className="px-6 py-3 font-medium">Saldo</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {installments?.map((cuota) => (
                  <tr key={cuota.idCuota} className="hover:bg-surfaceHighlight/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-main">
                      {cuota.nroCuota.toString().padStart(2, '0')}/{loan.cantidadCtas}
                    </td>
                    <td className="px-6 py-4 text-muted">{formatDate(cuota.fecVto)}</td>
                    <td className="px-6 py-4 text-main">{formatCurrency(cuota.monto)}</td>
                    <td className="px-6 py-4 text-main">{cuota.saldoPendiente ? formatCurrency(cuota.saldoPendiente) : '-'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge variant={
                        cuota.idEstado === InstallmentStatus.Paid ? 'success' :
                        cuota.idEstado === InstallmentStatus.Pending ? 'warning' :
                        'error'
                      }>
                        {getInstallmentStatusLabel(cuota.idEstado)}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {cuota.idEstado !== InstallmentStatus.Paid && (
                        <button
                          onClick={() => {
                            setSelectedInstallment(cuota);
                            setIsPaymentModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 rounded-lg text-xs font-medium transition-colors"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!installments?.length && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted">
                      No hay cuotas registradas para este préstamo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedInstallment(null);
        }}
        installment={selectedInstallment}
      />
    </div>
  );
}
