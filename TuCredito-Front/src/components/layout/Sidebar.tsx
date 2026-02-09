import { LayoutDashboard, Wallet, Users, Banknote, Calculator, Settings, LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Inicio', to: '/' },
  { icon: Wallet, label: 'Préstamos', to: '/loans' },
  { icon: Users, label: 'Clientes', to: '/borrowers' },
  { icon: Banknote, label: 'Pagos', to: '/payments' },
  { icon: Calculator, label: 'Calculadora', to: '/calculator' },
  { icon: Settings, label: 'Configuración', to: '/settings' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div className={cn(
        "flex h-screen w-72 flex-col bg-background/95 backdrop-blur-xl border-r border-border/50 transition-transform duration-300 z-50 fixed md:relative left-0 top-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-pink flex items-center justify-center">
                  <span className="font-bold text-white text-lg">T</span>
              </div>
              <div>
                  <h1 className="text-xl font-bold tracking-tight text-main">Tu Crédito</h1>
              </div>
          </div>
          {/* Close button mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-muted hover:text-main rounded-lg hover:bg-surfaceHighlight"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-2 p-4">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => onClose?.()} // Close sidebar on mobile navigation
              className={({ isActive }) =>
                cn(
                  "group flex items-center space-x-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary-500/10 text-primary-600 dark:text-white shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)] border border-primary-500/20"
                    : "text-muted hover:bg-surfaceHighlight hover:text-main"
                )
              }
            >
              {({ isActive }) => (
                  <>
                      <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary-500" : "text-muted group-hover:text-main")} />
                      <span>{item.label}</span>
                      {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />}
                  </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="glass-panel rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center text-white font-bold">
                      {user?.nombre?.charAt(0) || 'U'}
                  </div>
                  <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-main truncate">{user?.nombre} {user?.apellido}</p>
                      <p className="text-xs text-muted truncate">{user?.correo}</p>
                  </div>
              </div>
               <button
                  onClick={logout}
                  className="w-full flex items-center justify-center space-x-2 rounded-lg border border-border bg-surfaceHighlight/50 py-2 text-xs font-medium text-muted hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
                  >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Cerrar Sesión</span>
              </button>
          </div>
        </div>
      </div>
    </>
  );
}
