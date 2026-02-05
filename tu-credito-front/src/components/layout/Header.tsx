import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOfficialDollar } from '../../services/dollarService';
import { User, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: dollar } = useQuery({
    queryKey: ['dollar'],
    queryFn: getOfficialDollar,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const [isUserOpen, setIsUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex h-20 items-center justify-between px-8 py-4 relative z-20">
      <div className="flex items-center gap-6">
        {/* Breadcrumb or Page Title placeholder could go here */}
      </div>

      <div className="flex items-center space-x-6">
        {dollar && (
          <div className="hidden md:flex items-center space-x-2 rounded-full bg-surfaceHighlight border border-border px-4 py-1.5 text-xs font-medium text-main">
            <span className="text-secondary-400">US$ Oficial:</span>
            <span>${dollar.compra} / ${dollar.venta}</span>
          </div>
        )}

        <div className="flex items-center space-x-2">
            <button 
                onClick={toggleTheme}
                className="rounded-full p-2 text-muted hover:text-main hover:bg-surfaceHighlight transition-colors"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
        </div>
        
        <div className="flex items-center gap-3 pl-4 border-l border-border/50 relative" ref={userRef}>
             <button 
                onClick={() => setIsUserOpen(!isUserOpen)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
             >
                 <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-main">{user?.nombre || 'Usuario'} {user?.apellido || ''}</p>
                    <p className="text-xs text-muted">Administrador</p>
                 </div>
                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-accent-purple shadow-lg shadow-primary-500/20 text-white ring-2 ring-surface">
                    <User className="h-5 w-5" />
                </div>
            </button>

            {isUserOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg py-2 animate-in fade-in slide-in-from-top-2 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border md:hidden bg-surfaceHighlight/30">
                        <p className="text-sm font-medium text-main">{user?.nombre} {user?.apellido}</p>
                        <p className="text-xs text-muted">{user?.correo}</p>
                    </div>
                    
                    <div className="py-1">
                        <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-muted hover:text-main hover:bg-surfaceHighlight transition-colors" onClick={() => setIsUserOpen(false)}>
                            <User className="h-4 w-4" />
                            Mi Perfil
                        </Link>
                    </div>
                    
                    <div className="border-t border-border mt-1 pt-1">
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
}
