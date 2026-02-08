import { LoanForm } from '../components/loans/LoanForm';

export function CreateLoan() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-main">Alta de Préstamo</h2>
        <p className="text-muted">Registra un nuevo préstamo y simula el plan de pagos.</p>
      </div>
      <LoanForm />
    </div>
  );
}
