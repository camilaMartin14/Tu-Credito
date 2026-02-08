import { useState, useEffect } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, type: string) => void;
  isLoading: boolean;
  file: File | null;
}

const DOCUMENT_TYPES = [
  'Identidad',
  'Recibo de Sueldo',
  'Servicio',
  'Contrato',
  'Comprobante de Pago',
  'Otro'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

export function DocumentUploadModal({ isOpen, onClose, onUpload, isLoading, file }: DocumentUploadModalProps) {
  const [selectedType, setSelectedType] = useState(DOCUMENT_TYPES[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('El archivo excede el tamaño máximo permitido (5MB).');
      } else if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Formato de archivo no válido. Solo se permiten PDF, JPG y PNG.');
      } else {
        setError(null);
      }
    }
  }, [file]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-main">Subir Documento</h2>
          <button onClick={onClose} className="text-muted hover:text-main transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-surfaceHighlight/50 rounded-lg border border-border">
             <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500">
                <FileText className="h-5 w-5" />
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-medium text-main truncate">{file?.name}</p>
                <p className="text-xs text-muted">{(file?.size ? (file.size / 1024 / 1024).toFixed(2) : 0)} MB</p>
             </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-main">Tipo de Documento</label>
            <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-surfaceHighlight border border-border rounded-lg px-3 py-2 text-main focus:border-primary-500 focus:outline-none"
            >
                {DOCUMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-main transition-colors"
            >
                Cancelar
            </button>
            <button
                onClick={() => file && !error && onUpload(file, selectedType)}
                disabled={isLoading || !!error}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Subiendo...' : (
                    <>
                        <Upload className="h-4 w-4" />
                        Subir Archivo
                    </>
                )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
