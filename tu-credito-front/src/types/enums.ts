export enum LoanStatus {
  Active = 1,
  Finished = 2,
  Deleted = 3
}

export enum InstallmentStatus {
  Pending = 1,
  Paid = 2,
  Overdue = 3,
  Rescheduled = 4
}

export enum PaymentMethod {
  Transfer = 1,
  Cash = 2,
  CashUSD = 3,
  TransferUSD = 4
}

export const getLoanStatusLabel = (status: LoanStatus) => {
  switch (status) {
    case LoanStatus.Active: return 'Activo';
    case LoanStatus.Finished: return 'Finalizado';
    case LoanStatus.Deleted: return 'Eliminado';
    default: return 'Desconocido';
  }
};

export const getInstallmentStatusLabel = (status: InstallmentStatus) => {
  switch (status) {
    case InstallmentStatus.Pending: return 'Pendiente';
    case InstallmentStatus.Paid: return 'Saldada';
    case InstallmentStatus.Overdue: return 'Vencida';
    case InstallmentStatus.Rescheduled: return 'Reprogramada';
    default: return 'Desconocido';
  }
};

export const getPaymentMethodLabel = (method: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.Transfer: return 'Transferencia';
    case PaymentMethod.Cash: return 'Efectivo';
    case PaymentMethod.CashUSD: return 'Efectivo USD';
    case PaymentMethod.TransferUSD: return 'Transferencia USD';
    default: return `ID: ${method}`;
  }
};
