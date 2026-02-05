import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
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
      const response = await api.post('/lenders/login', data);
      login(response.data);
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
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-pink/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-8 glass-panel p-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-pink flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20">
            <span className="font-bold text-white text-3xl">T</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-main">Tu Credito</h1>
          <p className="mt-2 text-sm text-muted">Inicia sesión para gestionar tu cartera</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="usuario" className="block text-sm font-medium text-muted">Usuario</label>
              <input
                id="usuario"
                {...register('usuario')}
                required
                className="mt-1 block w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-main placeholder-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200"
                placeholder="Ingresa tu usuario"
              />
            </div>
            <div>
              <label htmlFor="contrasenia" className="block text-sm font-medium text-muted">Contraseña</label>
              <div className="relative mt-1">
                <input
                  id="contrasenia"
                  type={showPassword ? "text" : "password"}
                  {...register('contrasenia')}
                  required
                  className="block w-full rounded-xl border border-border bg-surface/50 px-4 py-3 pr-10 text-main placeholder-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200"
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

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-primary-600 to-accent-pink px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all duration-200 hover:shadow-primary-500/40 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Ingresar'}
          </button>

          <div className="text-center mt-4">
             <p className="text-sm text-muted">
                ¿No tienes una cuenta?{' '}
                <Link to="/register" className="font-medium text-primary-400 hover:text-primary-300">
                  Regístrate
                </Link>
             </p>
          </div>
        </form>
      </div>
    </div>
  );
}
