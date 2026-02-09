import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

const routeNameMap: Record<string, string> = {
  loans: 'Préstamos',
  create: 'Nuevo',
  edit: 'Editar',
  borrowers: 'Clientes',
  payments: 'Pagos',
  calculator: 'Calculadora',
  settings: 'Configuración',
  dashboard: 'Inicio'
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on dashboard (root)
  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted animate-in fade-in slide-in-from-left-2 duration-300">
      <Link 
        to="/" 
        className="flex items-center hover:text-primary-500 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        // Check if value is a number (likely an ID)
        const isId = !isNaN(Number(value));
        const displayName = isId 
          ? `#${value}` 
          : (routeNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1));

        return (
          <div key={to} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-muted/50" />
            {isLast ? (
              <span className="font-medium text-main">{displayName}</span>
            ) : (
              <Link 
                to={to} 
                className={cn(
                  "hover:text-primary-500 transition-colors",
                  isId && "pointer-events-none" // Disable links for intermediate IDs usually
                )}
              >
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}