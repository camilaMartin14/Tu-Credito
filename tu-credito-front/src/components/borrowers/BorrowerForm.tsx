import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { PrestatarioDTO } from '../../types';
import { useEffect } from 'react';

const borrowerSchema = z.object({
  dni: z.string().min(7, "DNI inválido").regex(/^\d+$/, "Solo se permiten números"),
  nombre: z.string().min(2, "Nombre obligatorio"),
  apellido: z.string().min(2, "Apellido obligatorio"),
  correo: z.string().email("Email inválido").or(z.literal('')),
  telefono: z.string().min(6, "Teléfono inválido").or(z.literal('')),
  domicilio: z.string().min(5, "Domicilio muy corto").or(z.literal('')),
  garanteNombre: z.string().optional(),
  garanteApellido: z.string().optional(),
  garanteDni: z.string().regex(/^\d*$/, "Solo se permiten números").optional().or(z.literal('')),
  garanteTelefono: z.string().optional(),
  garanteCorreo: z.string().email("Email inválido").optional().or(z.literal('')),
  garanteDomicilio: z.string().optional(),
});

export type BorrowerFormData = z.infer<typeof borrowerSchema>;

interface BorrowerFormProps {
  initialData?: PrestatarioDTO;
  onSubmit: (data: BorrowerFormData) => void;
  isLoading: boolean;
  submitLabel: string;
}

export function BorrowerForm({ initialData, onSubmit, isLoading, submitLabel }: BorrowerFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<BorrowerFormData>({
    resolver: zodResolver(borrowerSchema),
    defaultValues: {
      dni: '',
      nombre: '',
      apellido: '',
      correo: '',
      telefono: '',
      domicilio: '',
      garanteNombre: '',
      garanteApellido: '',
      garanteDni: '',
      garanteTelefono: '',
      garanteCorreo: '',
      garanteDomicilio: '',
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        dni: initialData.dni.toString(),
        nombre: initialData.nombre,
        apellido: initialData.apellido,
        correo: initialData.correo || '',
        telefono: initialData.telefono || '',
        domicilio: initialData.domicilio || '',
        garanteNombre: initialData.garanteNombre || '',
        garanteApellido: initialData.garanteApellido || '',
        garanteDni: initialData.garanteDni || '',
        garanteTelefono: initialData.garanteTelefono || '',
        garanteCorreo: initialData.garanteCorreo || '',
        garanteDomicilio: initialData.garanteDomicilio || '',
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Datos Personales */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 border-b border-border pb-2">Datos Personales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">DNI *</label>
            <input
              type="text"
              {...register('dni')}
              disabled={!!initialData} // DNI cannot be changed on edit
              className={`w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-main placeholder-muted focus:outline-none focus:border-primary-500 transition-colors ${initialData ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="12345678"
            />
            {errors.dni && <p className="text-xs text-red-400 mt-1">{errors.dni.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-muted mb-1">Nombre *</label>
                <input
                {...register('nombre')}
                className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-main placeholder-muted focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Juan"
                />
                {errors.nombre && <p className="text-xs text-red-400 mt-1">{errors.nombre.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-muted mb-1">Apellido *</label>
                <input
                {...register('apellido')}
                className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-main placeholder-muted focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Perez"
                />
                {errors.apellido && <p className="text-xs text-red-400 mt-1">{errors.apellido.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1">Email</label>
            <input
              type="email"
              {...register('correo')}
              className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-main placeholder-muted focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="juan@ejemplo.com"
            />
            {errors.correo && <p className="text-xs text-red-400 mt-1">{errors.correo.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1">Teléfono</label>
            <input
              {...register('telefono')}
              className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-main placeholder-muted focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="351 123 4567"
            />
             {errors.telefono && <p className="text-xs text-red-400 mt-1">{errors.telefono.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted mb-1">Domicilio</label>
            <input
              {...register('domicilio')}
              className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-main placeholder-muted focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="Av. Colon 123, Córdoba"
            />
             {errors.domicilio && <p className="text-xs text-red-400 mt-1">{errors.domicilio.message}</p>}
          </div>
        </div>
      </div>

      {/* Datos del Garante */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 border-b border-border pb-2 mt-2">Datos del Garante (Opcional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Nombre</label>
                    <input
                    {...register('garanteNombre')}
                    className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-main placeholder-muted focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="Maria"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Apellido</label>
                    <input
                    {...register('garanteApellido')}
                    className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-main placeholder-muted focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="Gomez"
                    />
                </div>
           </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1">DNI Garante</label>
            <input
              {...register('garanteDni')}
              className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-main placeholder-muted focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="87654321"
            />
             {errors.garanteDni && <p className="text-xs text-red-400 mt-1">{errors.garanteDni.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1">Teléfono Garante</label>
            <input
              {...register('garanteTelefono')}
              className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-main placeholder-muted focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="351 987 6543"
            />
          </div>
           
           <div>
            <label className="block text-sm font-medium text-muted mb-1">Email Garante</label>
            <input
              type="email"
              {...register('garanteCorreo')}
              className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-main placeholder-muted focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="maria@ejemplo.com"
            />
            {errors.garanteCorreo && <p className="text-xs text-red-400 mt-1">{errors.garanteCorreo.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted mb-1">Domicilio Garante</label>
            <input
              {...register('garanteDomicilio')}
              className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2.5 text-main placeholder-muted focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="Calle Falsa 123"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
        </button>
      </div>
    </form>
  );
}
