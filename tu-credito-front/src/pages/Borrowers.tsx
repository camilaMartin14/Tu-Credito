import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getBorrowers, toggleBorrowerStatus } from '../services/borrowerService';
import { getDelinquencyDetails } from '../services/dashboardService';
import { PrestatarioDTO } from '../types';
import { Plus, Search, User, Mail, Phone, MapPin, AlertCircle, Filter, X, Power, Pencil, Download } from 'lucide-react';
import { exportToPDF } from '../utils/pdfGenerator';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { useToast } from '../context/ToastContext';

export function Borrowers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all'); // all, active, inactive
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; dni?: number; currentStatus?: boolean }>({ isOpen: false });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ dni, activo }: { dni: number; activo: boolean }) => 
      toggleBorrowerStatus(dni, activo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['borrowers'] });
      addToast(`Cliente ${variables.activo ? 'activado' : 'desactivado'} correctamente`, 'success');
      setConfirmModal({ isOpen: false });
    },
    onError: () => {
      addToast('Error al cambiar el estado del cliente', 'error');
    }
  });

  const handleToggleStatus = (dni: number, currentStatus: boolean) => {
    setConfirmModal({ isOpen: true, dni, currentStatus });
  };

  const onConfirmToggle = () => {
    if (confirmModal.dni && confirmModal.currentStatus !== undefined) {
      toggleStatusMutation.mutate({ dni: confirmModal.dni, activo: !confirmModal.currentStatus });
    }
  };

  const handleExport = () => {
    if (!borrowers) return;

    const headers = ['DNI', 'Nombre', 'Apellido', 'Correo', 'Teléfono', 'Estado'];
    const data = borrowers.map(b => [
      b.dni.toString(),
      b.nombre,
      b.apellido,
      b.correo || '-',
      b.telefono || '-',
      b.esActivo ? 'Activo' : 'Inactivo'
    ]);

    exportToPDF('Reporte de Clientes', headers, data, 'clientes');
  };

  const getFilters = (): Partial<PrestatarioDTO> => {
    const filters: Partial<PrestatarioDTO> = {};
    
    if (debouncedSearchTerm) {
      if (/^\d+$/.test(debouncedSearchTerm)) {
        filters.dni = Number(debouncedSearchTerm);
      } else {
        filters.nombre = debouncedSearchTerm;
      }
    }

    if (activeFilter !== 'all') {
      filters.esActivo = activeFilter === 'active';
    }

    return filters;
  };

  const { data: borrowers, isLoading, error } = useQuery({
    queryKey: ['borrowers', debouncedSearchTerm, activeFilter],
    queryFn: () => getBorrowers(getFilters()),
    select: (data) => {
      return [...data].sort((a, b) => {
        const nameA = `${a.nombre} ${a.apellido}`.toLowerCase();
        const nameB = `${b.nombre} ${b.apellido}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }
  });

  const { data: delinquencyDetails } = useQuery({
    queryKey: ['delinquency'],
    queryFn: getDelinquencyDetails
  });

  const delinquentNames = new Set(delinquencyDetails?.map(d => d.cliente));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p>Error al cargar los clientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-main">Clientes</h1>
          <p className="text-muted">Directorio de prestatarios registrados</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-surfaceHighlight hover:bg-border text-main px-4 py-2 rounded-lg transition-colors border border-border"
            >
              <Download className="h-5 w-5" />
              Exportar
            </button>
            <button 
              onClick={() => navigate('/borrowers/create')}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary-500/20"
            >
              <Plus className="h-5 w-5" />
              Nuevo Cliente
            </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={onConfirmToggle}
        title={confirmModal.currentStatus ? "Desactivar Cliente" : "Activar Cliente"}
        message={`¿Está seguro que desea ${confirmModal.currentStatus ? 'desactivar' : 'activar'} a este cliente?`}
        confirmText={confirmModal.currentStatus ? "Desactivar" : "Activar"}
        cancelText="Cancelar"
        variant={confirmModal.currentStatus ? "danger" : "success"}
        isLoading={toggleStatusMutation.isPending}
      />

      <div className="glass-panel p-4 rounded-xl border border-border">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Buscar cliente por nombre o DNI (Presione Enter)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setDebouncedSearchTerm(searchTerm);
                  }
                }}
                className="w-full bg-surface/50 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-main placeholder-muted focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${showFilters ? 'bg-primary-500/10 border-primary-500 text-primary-500' : 'border-border text-muted hover:bg-surfaceHighlight'}`}
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>
          </div>

          {showFilters && (
            <div className="flex items-center gap-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted">Estado:</label>
                <div className="flex bg-surface/50 border border-border rounded-lg p-1">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeFilter === 'all' ? 'bg-primary-500 text-white' : 'text-muted hover:text-main'}`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setActiveFilter('active')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeFilter === 'active' ? 'bg-primary-500 text-white' : 'text-muted hover:text-main'}`}
                  >
                    Activos
                  </button>
                  <button
                    onClick={() => setActiveFilter('inactive')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeFilter === 'inactive' ? 'bg-primary-500 text-white' : 'text-muted hover:text-main'}`}
                  >
                    Inactivos
                  </button>
                </div>
              </div>
              
              {(debouncedSearchTerm || activeFilter !== 'all') && (
                 <button 
                  onClick={() => {
                    setSearchTerm('');
                    setDebouncedSearchTerm('');
                    setActiveFilter('all');
                  }}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 ml-auto"
                >
                  <X className="h-3 w-3" />
                  Limpiar
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {borrowers?.map((borrower) => {
            const isDelinquent = delinquentNames.has(`${borrower.nombre} ${borrower.apellido}`);
            return (
            <div key={borrower.dni} className={`rounded-xl p-5 border transition-all group ${
              isDelinquent 
                ? 'bg-red-500/5 border-red-500/30 hover:border-red-500/50' 
                : 'bg-surfaceHighlight/30 border-border hover:border-primary-500/50'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    isDelinquent ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-primary-500 to-accent-purple'
                  }`}>
                    {borrower.nombre?.[0]}{borrower.apellido?.[0]}
                  </div>
                  <div>
                    <h3 className={`font-semibold transition-colors ${
                      isDelinquent ? 'text-red-400 group-hover:text-red-300' : 'text-main group-hover:text-primary-400'
                    }`}>
                      {borrower.nombre} {borrower.apellido}
                    </h3>
                    <p className="text-xs text-muted">DNI: {borrower.dni}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${borrower.esActivo ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {borrower.esActivo ? 'Activo' : 'Inactivo'}
                  </span>
                  {isDelinquent && (
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/20">
                      Moroso
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{borrower.correo || 'No registrado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{borrower.telefono || 'No registrado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{borrower.domicilio || 'No registrado'}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                 <div className="flex gap-3">
                    <button 
                        onClick={() => navigate(`/borrowers/${borrower.dni}`)}
                        className="text-sm font-medium text-primary-400 hover:text-primary-300"
                    >
                        Ver Perfil
                    </button>
                    <button 
                        onClick={() => navigate(`/loans?dni=${borrower.dni}`)}
                        className="text-sm font-medium text-muted hover:text-main"
                    >
                        Historial
                    </button>
                    <button 
                        onClick={() => navigate(`/borrowers/edit/${borrower.dni}`)}
                        className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        title="Editar Cliente"
                    >
                        <Pencil className="h-3 w-3" /> Editar
                    </button>
                 </div>
                 
                 <button
                    onClick={() => handleToggleStatus(borrower.dni, borrower.esActivo)}
                    title={borrower.esActivo ? "Desactivar Cliente" : "Activar Cliente"}
                    className={`p-2 rounded-full transition-colors ${borrower.esActivo ? 'text-green-500 hover:bg-green-500/10' : 'text-red-500 hover:bg-red-500/10'}`}
                 >
                    <Power className="h-4 w-4" />
                 </button>
              </div>
            </div>
          ); })}
          
          {borrowers?.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted">
              <User className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No se encontraron clientes con los criterios de búsqueda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
