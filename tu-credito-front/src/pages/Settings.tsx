import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings as SettingsIcon, Bell, Shield, Moon, User, Globe, Check, AlertCircle, Loader2, Eye, EyeOff, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { updateProfile } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../lib/axios';

export function Settings() {
    const { theme, toggleTheme } = useTheme();
    const { user, login, token } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    
    // Password Change State
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Profile Edit State
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [profileError, setProfileError] = useState('');

    // Notifications State
    const [paymentAlerts, setPaymentAlerts] = useState(() => {
        return localStorage.getItem('paymentAlerts') === 'true';
    });

    const togglePaymentAlerts = () => {
        const newValue = !paymentAlerts;
        setPaymentAlerts(newValue);
        localStorage.setItem('paymentAlerts', String(newValue));
    };

    // Password Form
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
        defaultValues: {
            contraseniaActual: '',
            nuevaContrasenia: '',
            confirmarContrasenia: ''
        }
    });

    // Profile Form
    const { 
        register: registerProfile, 
        handleSubmit: handleSubmitProfile, 
        formState: { errors: errorsProfile },
        reset: resetProfile
    } = useForm({
        defaultValues: {
            nombre: user?.nombre || '',
            apellido: user?.apellido || '',
            email: user?.correo || '',
            usuario: user?.usuario || ''
        }
    });

    // Update form default values when user changes
    useEffect(() => {
        if (user) {
            resetProfile({
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.correo,
                usuario: user.usuario
            });
        }
    }, [user, resetProfile]);

    const profileMutation = useMutation({
        mutationFn: async (data: any) => {
            await updateProfile(data);
            // Fetch updated user data
            const response = await api.get('/lenders/me');
            return response.data;
        },
        onSuccess: (updatedUser) => {
            addToast('Perfil actualizado correctamente', 'success');
            // Update auth context
            if (token) {
                login({ token, prestamista: updatedUser });
            }
            setIsEditProfileOpen(false);
            setProfileError('');
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Error al actualizar el perfil';
            setProfileError(msg);
            addToast(msg, 'error');
        }
    });

    const onSubmitProfile = (data: any) => {
        profileMutation.mutate(data);
    };

    const mutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            addToast('Contraseña actualizada correctamente', 'success');
            reset();
            setIsChangePasswordOpen(false);
        },
        onError: (error: any) => {
            addToast((error as any)?.response?.data?.message || "Error al actualizar la contraseña", 'error');
        }
    });

    const onSubmitPassword = (data: any) => {
        if (data.nuevaContrasenia !== data.confirmarContrasenia) {
            return; // handled by validation
        }
        mutation.mutate({
            contraseniaActual: data.contraseniaActual,
            nuevaContrasenia: data.nuevaContrasenia
        });
    };

    const newPassword = watch("nuevaContrasenia");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-main">Configuración</h1>
        <p className="text-muted">Administra tus preferencias y la configuración de la cuenta</p>
      </div>

      <div className="glass-panel rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-main flex items-center gap-2">
            <User className="h-5 w-5 text-primary-500" />
            Perfil
          </h2>
        </div>
        <div className="p-6 space-y-4">
           <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-main">Información Personal</p>
                <p className="text-sm text-muted">Actualiza tu foto y datos personales</p>
              </div>
              <button 
                onClick={() => setIsEditProfileOpen(true)}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-surfaceHighlight transition-colors text-main"
              >
                {isEditProfileOpen ? 'Editando...' : 'Editar'}
              </button>
           </div>

           {isEditProfileOpen && (
               <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="mt-4 space-y-4 p-4 bg-surfaceHighlight/30 rounded-xl border border-border animate-in fade-in slide-in-from-top-2 relative">
                   <button 
                       type="button" 
                       onClick={() => setIsEditProfileOpen(false)}
                       className="absolute top-2 right-2 text-muted hover:text-main p-1"
                   >
                       <X className="h-4 w-4" />
                   </button>
                   
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="block text-sm font-medium text-muted mb-1">Nombre</label>
                           <input 
                               {...registerProfile("nombre", { required: "El nombre es requerido", maxLength: { value: 60, message: "Máximo 60 caracteres" } })}
                               className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2 text-main focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                           />
                           {errorsProfile.nombre && <span className="text-xs text-red-400 mt-1">{errorsProfile.nombre.message as string}</span>}
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-muted mb-1">Apellido</label>
                           <input 
                               {...registerProfile("apellido", { required: "El apellido es requerido", maxLength: { value: 60, message: "Máximo 60 caracteres" } })}
                               className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2 text-main focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                           />
                           {errorsProfile.apellido && <span className="text-xs text-red-400 mt-1">{errorsProfile.apellido.message as string}</span>}
                       </div>
                   </div>

                   <div>
                       <label className="block text-sm font-medium text-muted mb-1">Correo Electrónico</label>
                       <input 
                           type="email"
                           {...registerProfile("email", { 
                               required: "El correo es requerido",
                               pattern: { value: /^\S+@\S+$/i, message: "Correo inválido" },
                               maxLength: { value: 50, message: "Máximo 50 caracteres" }
                           })}
                           className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2 text-main focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                       />
                       {errorsProfile.email && <span className="text-xs text-red-400 mt-1">{errorsProfile.email.message as string}</span>}
                   </div>

                   <div>
                       <label className="block text-sm font-medium text-muted mb-1">Usuario</label>
                       <input 
                           {...registerProfile("usuario", { required: "El usuario es requerido", maxLength: { value: 10, message: "Máximo 10 caracteres" } })}
                           className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2 text-main focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                       />
                       {errorsProfile.usuario && <span className="text-xs text-red-400 mt-1">{errorsProfile.usuario.message as string}</span>}
                   </div>

                   {profileError && (
                       <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                           <AlertCircle className="h-4 w-4" />
                           <span>{profileError}</span>
                       </div>
                   )}

                   <div className="flex justify-end pt-2 gap-2">
                       <button 
                           type="button"
                           onClick={() => setIsEditProfileOpen(false)}
                           className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-surfaceHighlight transition-colors text-main"
                       >
                           Cancelar
                       </button>
                       <button 
                           type="submit" 
                           disabled={profileMutation.isPending}
                           className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2 disabled:opacity-50"
                       >
                           {profileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                           Guardar Cambios
                       </button>
                   </div>
               </form>
           )}
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-main flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary-500" />
            Apariencia
          </h2>
        </div>
        <div className="p-6 space-y-4">
           <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-main">Tema</p>
                <p className="text-sm text-muted">Alternar entre modo claro y oscuro</p>
              </div>
              <button 
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-surfaceHighlight transition-colors text-main"
              >
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <SettingsIcon className="h-4 w-4" />}
                {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
              </button>
           </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-main flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-500" />
            Notificaciones
          </h2>
        </div>
        <div className="p-6 space-y-4">
           <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-main">Alertas de Pagos</p>
                <p className="text-sm text-muted">Recibir notificaciones cuando un pago esté próximo</p>
              </div>
              <button 
                onClick={togglePaymentAlerts}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${paymentAlerts ? 'bg-primary-600' : 'bg-surfaceHighlight'}`}
              >
                <span className={`${paymentAlerts ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`} />
              </button>
           </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-main flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-500" />
            Seguridad
          </h2>
        </div>
        <div className="p-6 space-y-4">
           <div className="flex items-start justify-between py-2">
              <div>
                <p className="font-medium text-main">Cambiar Contraseña</p>
                <p className="text-sm text-muted">Se recomienda cambiarla cada 3 meses</p>
              </div>
              <button 
                onClick={() => setIsChangePasswordOpen(!isChangePasswordOpen)}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-surfaceHighlight transition-colors text-main"
              >
                {isChangePasswordOpen ? 'Cancelar' : 'Actualizar'}
              </button>
           </div>

           {isChangePasswordOpen && (
               <form onSubmit={handleSubmit(onSubmitPassword)} className="mt-4 space-y-4 p-4 bg-surfaceHighlight/30 rounded-xl border border-border animate-in fade-in slide-in-from-top-2">
                   <div>
                       <label className="block text-sm font-medium text-muted mb-1">Contraseña Actual</label>
                       <div className="relative">
                           <input 
                               type={showCurrent ? "text" : "password"}
                               {...register("contraseniaActual", { required: "La contraseña actual es requerida" })}
                               className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2 pr-10 text-main focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                           />
                           <button
                               type="button"
                               onClick={() => setShowCurrent(!showCurrent)}
                               className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-main transition-colors"
                           >
                               {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                       </div>
                       {errors.contraseniaActual && <span className="text-xs text-red-400 mt-1">{errors.contraseniaActual.message as string}</span>}
                   </div>
                   
                   <div>
                       <label className="block text-sm font-medium text-muted mb-1">Nueva Contraseña</label>
                       <div className="relative">
                           <input 
                               type={showNew ? "text" : "password"}
                               {...register("nuevaContrasenia", { 
                                   required: "La nueva contraseña es requerida",
                                   minLength: { value: 8, message: "Mínimo 8 caracteres" },
                                   pattern: { value: /^(?=.*[0-9]).*$/, message: "Debe contener al menos un número" }
                               })}
                               className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2 pr-10 text-main focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                           />
                           <button
                               type="button"
                               onClick={() => setShowNew(!showNew)}
                               className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-main transition-colors"
                           >
                               {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                       </div>
                       {errors.nuevaContrasenia && <span className="text-xs text-red-400 mt-1">{errors.nuevaContrasenia.message as string}</span>}
                   </div>

                   <div>
                       <label className="block text-sm font-medium text-muted mb-1">Confirmar Nueva Contraseña</label>
                       <div className="relative">
                           <input 
                               type={showConfirm ? "text" : "password"}
                               {...register("confirmarContrasenia", { 
                                   required: "Confirma tu nueva contraseña",
                                   validate: value => value === newPassword || "Las contraseñas no coinciden"
                               })}
                               className="w-full bg-surface/50 border border-border rounded-lg px-4 py-2 pr-10 text-main focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                           />
                           <button
                               type="button"
                               onClick={() => setShowConfirm(!showConfirm)}
                               className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-main transition-colors"
                           >
                               {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                       </div>
                       {errors.confirmarContrasenia && <span className="text-xs text-red-400 mt-1">{errors.confirmarContrasenia.message as string}</span>}
                   </div>

                   {mutation.isError && (
                       <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                           <AlertCircle className="h-4 w-4" />
                           <span>{(mutation.error as any)?.response?.data?.message || "Error al actualizar la contraseña"}</span>
                       </div>
                   )}

                   <div className="flex justify-end pt-2">
                       <button 
                           type="submit" 
                           disabled={mutation.isPending}
                           className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2 disabled:opacity-50"
                       >
                           {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                           Guardar Cambios
                       </button>
                   </div>
               </form>
           )}
        </div>
      </div>
    </div>
  );
}
