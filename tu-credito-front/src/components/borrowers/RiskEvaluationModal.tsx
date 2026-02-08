import { useState, useEffect } from 'react';
import { X, DollarSign, Calculator, Wallet, User } from 'lucide-react';
import { EvaluacionCrediticiaRequestDTO } from '../../types';

interface RiskEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: EvaluacionCrediticiaRequestDTO) => void;
  isLoading: boolean;
}

export function RiskEvaluationModal({ isOpen, onClose, onConfirm, isLoading }: RiskEvaluationModalProps) {
  const [formData, setFormData] = useState({
    cuit: '',
    montoSolicitado: '',
    cuotaEstimada: '',
    ingresoMensual: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        cuit: '',
        montoSolicitado: '',
        cuotaEstimada: '',
        ingresoMensual: ''
      });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.cuit.length !== 11) {
      setError('El CUIT debe tener exactamente 11 dígitos');
      return;
    }

    onConfirm({
      cuit: Number(formData.cuit),
      montoSolicitado: Number(formData.montoSolicitado),
      cuotaEstimada: Number(formData.cuotaEstimada),
      ingresoMensual: Number(formData.ingresoMensual)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-main">Evaluar Riesgo Crediticio</h2>
          <button onClick={onClose} className="text-muted hover:text-main transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted">CUIT / CUIL</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="number"
                required
                value={formData.cuit}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, cuit: e.target.value }));
                  setError('');
                }}
                className={`w-full bg-surfaceHighlight/50 border rounded-lg pl-10 pr-4 py-2 text-main focus:outline-none focus:ring-1 transition-colors ${
                  error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary-500 focus:ring-primary-500'
                }`}
                placeholder="20123456789"
              />
            </div>
            <p className="text-xs text-muted">Ingrese el CUIT sin guiones (11 dígitos).</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted">Monto Solicitado</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.montoSolicitado}
                onChange={(e) => setFormData(prev => ({ ...prev, montoSolicitado: e.target.value }))}
                className="w-full bg-surfaceHighlight/50 border border-border rounded-lg pl-10 pr-4 py-2 text-main focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted">Cuota Estimada</label>
            <div className="relative">
              <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.cuotaEstimada}
                onChange={(e) => setFormData(prev => ({ ...prev, cuotaEstimada: e.target.value }))}
                className="w-full bg-surfaceHighlight/50 border border-border rounded-lg pl-10 pr-4 py-2 text-main focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted">Ingreso Mensual</label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.ingresoMensual}
                onChange={(e) => setFormData(prev => ({ ...prev, ingresoMensual: e.target.value }))}
                className="w-full bg-surfaceHighlight/50 border border-border rounded-lg pl-10 pr-4 py-2 text-main focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-surfaceHighlight hover:bg-border text-main rounded-lg transition-colors border border-border"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Evaluando...
                </>
              ) : (
                'Evaluar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
