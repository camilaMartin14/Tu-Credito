import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBorrower } from '../services/borrowerService';
import { PrestatarioDTO } from '../types';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { BorrowerForm, BorrowerFormData } from '../components/borrowers/BorrowerForm';
import { useToast } from '../context/ToastContext';

export function CreateBorrower() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: BorrowerFormData) => {
    setIsLoading(true);
    try {
      const payload: PrestatarioDTO = {
        ...data,
        dni: Number(data.dni),
        esActivo: true,
        // Optional fields
        telefono: data.telefono || '',
        domicilio: data.domicilio || '',
        correo: data.correo || '',
        garanteNombre: data.garanteNombre || undefined,
        garanteApellido: data.garanteApellido || undefined,
        garanteDni: data.garanteDni || undefined,
        garanteTelefono: data.garanteTelefono || undefined,
        garanteCorreo: data.garanteCorreo || undefined,
        garanteDomicilio: data.garanteDomicilio || undefined,
      };
      
      await createBorrower(payload);
      addToast('Cliente registrado correctamente', 'success');
      navigate('/borrowers');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Error al registrar el cliente', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/borrowers')}
          className="p-2 hover:bg-surfaceHighlight rounded-lg transition-colors text-muted hover:text-main"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-main">Nuevo Cliente</h1>
          <p className="text-muted">Registrar un nuevo prestatario en el sistema</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-border">
        <BorrowerForm 
          onSubmit={onSubmit} 
          isLoading={isLoading} 
          submitLabel="Guardar Cliente" 
        />
      </div>
    </div>
  );
}
