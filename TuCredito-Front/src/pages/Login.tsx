import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { login as loginService } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Eye, EyeOff, ShieldCheck, PieChart } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { register, handleSubmit } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError('');
    try {
      const responseData = await loginService(data);
      login(responseData);
      addToast('Sesión iniciada correctamente', 'success');
      navigate('/');
    } catch (err) {
      const msg = 'Credenciales inválidas';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background relative">
      <div className="absolute inset-0 lg:hidden z-0">
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
          alt="Finance Building" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/85 backdrop-blur-[2px]" />
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-gray-900/80 to-black/60 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
          alt="Finance Building" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        
        <div className="relative z-20 flex flex-col justify-between h-full p-16 text-white">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-pink flex items-center justify-center shadow-lg shadow-primary-500/20">
                <span className="font-bold text-white text-xl">T</span>
             </div>
             <span className="text-2xl font-bold tracking-tight">Tu Crédito</span>
          </div>

          <div className="space-y-8 max-w-xl">
            <h1 className="text-5xl font-bold leading-tight">
              Organiza y Escala <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-pink">Tu Cartera de Préstamos</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              La solución definitiva para gestionar créditos, controlar vencimientos y automatizar tu flujo de trabajo en un solo lugar.
            </p>
            
            <div className="flex justify-center gap-4 pt-4">
               <div className="flex items-center gap-2 text-sm font-medium text-gray-200 bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4 text-primary-400" /> Seguridad Bancaria
               </div>
               <div className="flex items-center gap-2 text-sm font-medium text-gray-200 bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                  <PieChart className="w-4 h-4 text-accent-pink" /> Analytics Real-time
               </div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            © 2026 Tu Crédito Inc. Todos los derechos reservados.
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
         <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-50 lg:opacity-100">
            <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary-500/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[20%] h-[20%] bg-accent-pink/5 rounded-full blur-[100px]" />
         </div>

        <div className="w-full max-w-[400px] space-y-8 relative z-10 bg-surface/50 lg:bg-transparent p-6 lg:p-0 rounded-2xl lg:rounded-none border border-border/50 lg:border-none backdrop-blur-md lg:backdrop-blur-none shadow-xl lg:shadow-none">
          <div className="text-center lg:text-left space-y-2">
            <div className="lg:hidden mx-auto h-12 w-12 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-pink flex items-center justify-center mb-6 shadow-lg shadow-primary-500/20">
               <span className="font-bold text-white text-2xl">T</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-main">¡Hola de nuevo! 👋</h2>
            <p className="text-muted text-base">Ingresa tus credenciales para acceder al panel.</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="usuario" className="block text-sm font-medium text-main ml-1">Usuario</label>
                <input
                  id="usuario"
                  {...register('usuario')}
                  required
                  className="block w-full rounded-xl border border-border bg-surface/50 px-4 py-3.5 text-main placeholder-muted/70 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 outline-none"
                  placeholder="Ej. admin"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                   <label htmlFor="contrasenia" className="block text-sm font-medium text-main">Contraseña</label>
                   <a href="#" className="text-xs font-medium text-primary-500 hover:text-primary-600">¿Olvidaste tu contraseña?</a>
                </div>
                <div className="relative">
                  <input
                    id="contrasenia"
                    type={showPassword ? "text" : "password"}
                    {...register('contrasenia')}
                    required
                    className="block w-full rounded-xl border border-border bg-surface/50 px-4 py-3.5 pr-10 text-main placeholder-muted/70 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-main transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-primary-600 to-accent-pink px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition-all duration-300 hover:shadow-primary-500/40 hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="text-center pt-2">
              <p className="text-sm text-muted">
                 ¿Aún no tienes cuenta?{' '}
                 <Link to="/register" className="font-semibold text-primary-500 hover:text-primary-600 transition-colors">
                   Regístrate
                 </Link>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
