import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBorrowers } from '../../services/borrowerService';
import { getLoansByFilter } from '../../services/loanService';
import { getInstallments } from '../../services/installmentService';
import { PrestatarioDTO, PrestamoDTO, Cuota } from '../../types';
import { InstallmentStatus } from '../../types/enums';
import { X, Search, User, FileText, ChevronRight, CreditCard, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallmentSelect: (installment: Cuota, currency: string) => void;
}

export function NewPaymentModal({ isOpen, onClose, onInstallmentSelect }: NewPaymentModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBorrower, setSelectedBorrower] = useState<PrestatarioDTO | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<PrestamoDTO | null>(null);

  const { data: borrowers, isLoading: isLoadingBorrowers } = useQuery({
    queryKey: ['borrowers', searchTerm],
    queryFn: () => getBorrowers(searchTerm ? { nombre: searchTerm } : undefined),
    enabled: isOpen && step === 1,
  });

  const { data: loans, isLoading: isLoadingLoans } = useQuery({
    queryKey: ['loans', selectedBorrower?.dni],
    queryFn: () => getLoansByFilter({ nombre: selectedBorrower?.nombre }),
    enabled: isOpen && step === 2 && !!selectedBorrower,
  });

  const { data: installments, isLoading: isLoadingInstallments } = useQuery({
    queryKey: ['installments', selectedLoan?.idPrestamo],
    queryFn: () => getInstallments({ idPrestamo: selectedLoan?.idPrestamo }),
    enabled: isOpen && step === 3 && !!selectedLoan,
  });

  const filteredLoans = loans?.filter(l => l.dniPrestatario === selectedBorrower?.dni);
  const pendingInstallments = installments?.filter(i => i.idEstado !== InstallmentStatus.Paid && (i.saldoPendiente === undefined || i.saldoPendiente > 0));

  if (!isOpen) return null;

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => (s - 1) as 1 | 2 | 3);
      if (step === 2) setSelectedBorrower(null);
      if (step === 3) setSelectedLoan(null);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button onClick={handleBack} className="text-muted hover:text-main transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-semibold text-main">Nuevo Pago</h2>
              <p className="text-xs text-muted">
                Paso {step} de 3: {
                  step === 1 ? 'Seleccionar Cliente' :
                  step === 2 ? 'Seleccionar Préstamo' :
                  'Seleccionar Cuota'
                }
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-main transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder="Buscar cliente por nombre, apellido o DNI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surfaceHighlight border border-border rounded-lg pl-10 pr-4 py-3 text-main focus:border-primary-500 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              {isLoadingBorrowers ? (
                <div className="text-center py-8 text-muted">Buscando clientes...</div>
              ) : borrowers?.length === 0 ? (
                <div className="text-center py-8 text-muted">No se encontraron clientes.</div>
              ) : (
                <div className="grid gap-2">
                  {borrowers?.map((borrower) => (
                    <button
                      key={borrower.dni}
                      onClick={() => {
                        setSelectedBorrower(borrower);
                        setStep(2);
                      }}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-surfaceHighlight/50 hover:bg-surfaceHighlight hover:border-primary-500/50 transition-all group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 group-hover:bg-primary-500/20 group-hover:text-primary-300 transition-colors">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-main">{borrower.nombre} {borrower.apellido}</p>
                          <p className="text-xs text-muted">DNI: {borrower.dni}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted group-hover:text-primary-400 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && selectedBorrower && (
            <div className="space-y-4">
              <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3 flex items-center gap-3">
                <User className="h-5 w-5 text-primary-400" />
                <div>
                  <p className="text-sm font-medium text-main">{selectedBorrower.nombre} {selectedBorrower.apellido}</p>
                  <p className="text-xs text-primary-400/80">Cliente seleccionado</p>
                </div>
              </div>

              <h3 className="text-sm font-medium text-muted uppercase tracking-wider">Préstamos Activos</h3>

              {isLoadingLoans ? (
                <div className="text-center py-8 text-muted">Cargando préstamos...</div>
              ) : filteredLoans?.length === 0 ? (
                <div className="text-center py-8 text-muted">Este cliente no tiene préstamos registrados.</div>
              ) : (
                <div className="grid gap-2">
                  {filteredLoans?.map((loan) => (
                    <button
                      key={loan.idPrestamo}
                      onClick={() => {
                        setSelectedLoan(loan);
                        setStep(3);
                      }}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-surfaceHighlight/50 hover:bg-surfaceHighlight hover:border-primary-500/50 transition-all group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-main">Préstamo #{loan.idPrestamo}</p>
                          <p className="text-xs text-muted">
                            Monto: {formatCurrency(loan.montoOtorgado, loan.moneda)} • {formatDate(loan.fechaOtorgamiento)}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted group-hover:text-blue-400 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && selectedLoan && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-main">Préstamo #{selectedLoan.idPrestamo}</p>
                  <p className="text-xs text-blue-400/80">
                    {formatCurrency(selectedLoan.montoOtorgado, selectedLoan.moneda)} - {formatDate(selectedLoan.fechaOtorgamiento)}
                  </p>
                </div>
              </div>

              <h3 className="text-sm font-medium text-muted uppercase tracking-wider">Cuotas Pendientes</h3>

              {isLoadingInstallments ? (
                <div className="text-center py-8 text-muted">Cargando cuotas...</div>
              ) : pendingInstallments?.length === 0 ? (
                <div className="text-center py-8 text-muted">No hay cuotas pendientes para este préstamo.</div>
              ) : (
                <div className="grid gap-2">
                  {pendingInstallments?.map((installment) => (
                    <button
                      key={installment.idCuota}
                      onClick={() => onInstallmentSelect(installment, selectedLoan.moneda)}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-surfaceHighlight/50 hover:bg-surfaceHighlight hover:border-green-500/50 transition-all group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 group-hover:bg-green-500/20 group-hover:text-green-300 transition-colors">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-main">Cuota #{installment.nroCuota}</p>
                          <p className="text-xs text-muted">
                            Vence: {formatDate(installment.fecVto)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">{formatCurrency(installment.saldoPendiente || installment.monto)}</p>
                        <p className="text-xs text-muted">Seleccionar para pagar</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
