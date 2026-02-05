import { X, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning' | 'success';
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  isLoading = false
}: ConfirmationModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <HelpCircle className="h-6 w-6 text-primary-500" />;
    }
  };

  const getButtonStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      default:
        return 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={isLoading ? undefined : onClose}
      />
      
      <div className={`relative bg-background border border-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full bg-surfaceHighlight shrink-0 ${
              variant === 'danger' ? 'bg-red-500/10' : 
              variant === 'warning' ? 'bg-yellow-500/10' : 
              variant === 'success' ? 'bg-green-500/10' : 'bg-primary-500/10'
            }`}>
              {getIcon()}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-main mb-2">
                {title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-surfaceHighlight/30 border-t border-border">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-main hover:bg-surfaceHighlight transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 ${getButtonStyles()}`}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </button>
        </div>

        {!isLoading && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-muted hover:text-main transition-colors p-1 hover:bg-surfaceHighlight rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
