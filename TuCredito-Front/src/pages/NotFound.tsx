import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="bg-surfaceHighlight/30 p-8 rounded-2xl border border-border backdrop-blur-sm max-w-md w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="bg-red-500/10 p-4 rounded-full mb-6">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        
        <h1 className="text-4xl font-bold text-main mb-2">404</h1>
        <h2 className="text-xl font-semibold text-main mb-4">Página no encontrada</h2>
        
        <p className="text-muted mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        
        <Link 
          to="/" 
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-0.5"
        >
          <Home className="h-5 w-5" />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
