import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLoansByFilter, archiveLoan, deleteLoan } from '../services/loanService';
import { Plus, Search, Filter, ArrowUpRight, AlertCircle, X, Download, Archive, Trash2, Info } from 'lucide-react';
import { exportToPDF } from '../utils/pdfGenerator';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LoanStatus, getLoanStatusLabel } from '../types/enums';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { useToast } from '../context/ToastContext';

export function Loans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    nombre: '',
    estado: 0,
    mesVto: 0,
    anio: 0
  });

  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setFilters(prev => ({ ...prev, estado: Number(statusParam) }));
      setShowFilters(true);
    }
  }, [searchParams]);
  const [yearInput, setYearInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id?: number; type: 'archive' | 'delete' }>({ isOpen: false, type: 'archive' });

  // Debounce search input could be better, but for now direct state update
  // Ideally use a debounce hook or library

  const { data: loans, isLoading, error } = useQuery({
    queryKey: ['loans', filters],
    queryFn: async () => {
      // Fetch data without filters first if backend filtering is unreliable, 
      // or fetch with partial filters and refine on client side.
      // Given the issue with year filtering, we will filter client-side for year.
      const data = await getLoansByFilter({
        nombre: filters.nombre || undefined,
        estado: filters.estado || undefined,
        mesVto: filters.mesVto || undefined,
        // We temporarily ignore 'anio' in backend call if it's causing issues, or keep it and double check on client
        anio: filters.anio || undefined
      });

      // Client-side filtering fix for Year and Month to ensure accuracy
      let filteredData = data;

      if (filters.anio > 0) {
        filteredData = filteredData.filter(loan => {
          if (!loan.fechaOtorgamiento) return false;
          // Check if loan was granted in that year OR has first due date in that year
          const grantYear = new Date(loan.fechaOtorgamiento).getFullYear();
          const firstDueYear = loan.fec1erVto ? new Date(loan.fec1erVto).getFullYear() : grantYear;
          return grantYear === filters.anio || firstDueYear === filters.anio;
        });
      }
      
      return filteredData;
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: number) => archiveLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      addToast('Préstamo finalizado/archivado correctamente', 'success');
      setConfirmModal({ ...confirmModal, isOpen: false });
    },
    onError: () => {
      addToast('Error al archivar el préstamo', 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      addToast('Préstamo eliminado correctamente', 'success');
      setConfirmModal({ ...confirmModal, isOpen: false });
    },
    onError: () => {
      addToast('Error al eliminar el préstamo', 'error');
    }
  });

  const handleArchive = (id: number) => {
    setConfirmModal({ isOpen: true, id, type: 'archive' });
  };

  const handleDelete = (id: number) => {
    setConfirmModal({ isOpen: true, id, type: 'delete' });
  };

  const onConfirmAction = () => {
    if (confirmModal.id) {
      if (confirmModal.type === 'archive') {
        archiveMutation.mutate(confirmModal.id);
      } else {
        deleteMutation.mutate(confirmModal.id);
      }
    }
  };

  const handleExport = () => {
    if (!loans) return;

    const headers = ['ID', 'Cliente', 'Monto', 'Tasa %', 'Fecha', 'Estado'];
    const data = loans.map(loan => [
      loan.idPrestamo?.toString() || '-',
      loan.nombrePrestatario || '',
      `$${loan.montoOtorgado?.toLocaleString() || '0'}`,
      `${loan.tasaInteres || 0}%`,
      loan.fechaOtorgamiento ? new Date(loan.fechaOtorgamiento).toLocaleDateString() : '-',
      getLoanStatusLabel(loan.idEstado)
    ]);

    exportToPDF('Reporte de Préstamos', headers, data, 'prestamos');
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      nombre: '',
      estado: 0,
      mesVto: 0,
      anio: 0
    });
    setYearInput('');
    setNameInput('');
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p>Error al cargar los préstamos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-main">Préstamos</h1>
          <p className="text-muted">Gestiona y visualiza todos los préstamos activos</p>
        </div>
        <div className="flex gap-2">
            <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-surfaceHighlight hover:bg-border text-main px-4 py-2 rounded-lg transition-colors border border-border"
            >
            <Download className="h-5 w-5" />
            Exportar
            </button>
            <Link
            to="/loans/create"
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary-500/20"
            >
            <Plus className="h-5 w-5" />
            Nuevo Préstamo
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary-500/10 text-primary-500">
            <ArrowUpRight className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted">Total Préstamos</p>
            <p className="text-2xl font-bold text-main">{loans?.length || 0}</p>
          </div>
        </div>
      </div>

      {filters.estado === LoanStatus.Active && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-400">Préstamos con Capital Pendiente</h3>
            <p className="text-sm text-blue-400/80 mt-1">
              Estos son los préstamos que actualmente se encuentran activos y tienen cuotas pendientes de pago. 
              El "Capital Pendiente" es la suma de los saldos restantes de estos préstamos.
            </p>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={onConfirmAction}
        title={confirmModal.type === 'archive' ? "Archivar Préstamo" : "Eliminar Préstamo"}
        message={confirmModal.type === 'archive' 
          ? "¿Estás seguro de que deseas finalizar/archivar este préstamo? Esta acción no se puede deshacer."
          : "¿Estás seguro de que deseas eliminar este préstamo? Esta acción no se puede deshacer."}
        confirmText={confirmModal.type === 'archive' ? "Archivar" : "Eliminar"}
        cancelText="Cancelar"
        variant={confirmModal.type === 'archive' ? "warning" : "danger"}
        isLoading={archiveMutation.isPending || deleteMutation.isPending}
      />
      <div className="glass-panel rounded-xl overflow-hidden border border-border">
        <div className="p-4 border-b border-border flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Buscar por cliente..."
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFilterChange('nombre', nameInput);
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Estado</label>
                <select 
                  value={filters.estado}
                  onChange={(e) => handleFilterChange('estado', Number(e.target.value))}
                  className="w-full bg-surface/50 border border-border rounded-lg px-3 py-2 text-sm text-main focus:outline-none focus:border-primary-500 [&>option]:bg-surface"
                >
                  <option value={0}>Todos</option>
                  <option value={LoanStatus.Active}>Activo</option>
                  <option value={LoanStatus.Finished}>Finalizado</option>
                  <option value={LoanStatus.Deleted}>Eliminado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Mes Vencimiento</label>
                <select 
                  value={filters.mesVto}
                  onChange={(e) => handleFilterChange('mesVto', Number(e.target.value))}
                  className="w-full bg-surface/50 border border-border rounded-lg px-3 py-2 text-sm text-main focus:outline-none focus:border-primary-500 [&>option]:bg-surface"
                >
                  <option value={0}>Todos</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('es', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Año</label>
                <input 
                  type="number"
                  placeholder="Ej. 2024"
                  value={yearInput}
                  onChange={(e) => setYearInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleFilterChange('anio', Number(yearInput));
                    }
                  }}
                  className="w-full bg-surface/50 border border-border rounded-lg px-3 py-2 text-sm text-main focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={clearFilters}
                  className="flex items-center justify-center gap-2 px-3 py-2 border border-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition-colors w-full"
                >
                  <X className="h-4 w-4" />
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
             <div className="flex items-center justify-center h-64">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
             </div>
          ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-surfaceHighlight text-muted">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Monto</th>
                <th className="px-6 py-3 font-medium">Tasa</th>
                <th className="px-6 py-3 font-medium">Fecha</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loans?.map((loan) => (
                <tr key={loan.idPrestamo} className="hover:bg-surfaceHighlight/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-main">#{loan.idPrestamo}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/borrowers/${loan.dniPrestatario}`)}
                      className="text-primary-400 hover:text-primary-300 font-medium hover:underline text-left"
                    >
                      {loan.nombrePrestatario || 'N/A'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-main">${loan.montoOtorgado?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-muted">{loan.tasaInteres}%</td>
                  <td className="px-6 py-4 text-muted">
                    {loan.fechaOtorgamiento ? new Date(loan.fechaOtorgamiento).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${loan.idEstado === 1 ? 'bg-green-500/10 text-green-500' : 
                        loan.idEstado === 2 ? 'bg-blue-500/10 text-blue-500' : 
                        'bg-red-500/10 text-red-500'}`}>
                      {getLoanStatusLabel(loan.idEstado)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link 
                        to={`/loans/${loan.idPrestamo}`}
                        className="text-primary-400 hover:text-primary-300 font-medium hover:underline"
                        title="Ver detalles"
                      >
                        Ver detalles
                      </Link>
                      {(loan.idEstado === 1) && (
                        <button
                          onClick={() => handleArchive(loan.idPrestamo || 0)}
                          className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 p-1.5 rounded-lg transition-colors"
                          title="Finalizar/Archivar Préstamo"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      )}
                      {(loan.idEstado === 1 || loan.idEstado === 2) && (
                        <button
                          onClick={() => handleDelete(loan.idPrestamo || 0)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1.5 rounded-lg transition-colors"
                          title="Eliminar Préstamo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {loans?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted">
                    No se encontraron préstamos con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
}
