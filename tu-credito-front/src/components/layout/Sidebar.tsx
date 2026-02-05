import { LayoutDashboard, Wallet, Users, Banknote, Calculator, Settings, LogOut, Plus } from 'lucide-react';
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

export function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <div className="flex h-screen w-72 flex-col bg-background/50 backdrop-blur-xl border-r border-border/50">
      <div className="flex h-20 items-center px-6">
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-pink flex items-center justify-center">
                <span className="font-bold text-white text-lg">T</span>
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-main">Tu Credito</h1>
                <p className="text-xs text-muted font-medium tracking-wide">CAPITAL</p>
            </div>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2 p-4">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
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

        <div className="mt-8 px-2">
            <button className="w-full primary-gradient rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-white font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all active:scale-95">
                <Plus className="h-5 w-5" />
                <span>Nuevo Préstamo</span>
            </button>
        </div>
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
  );
}
