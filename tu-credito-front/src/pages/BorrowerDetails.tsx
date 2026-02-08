import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBorrowerByDni, updateBorrower } from '../services/borrowerService';
import { getLoans } from '../services/loanService';
import { getDocuments, uploadDocument, deleteDocument, downloadDocument, viewDocument } from '../services/documentService';
import { evaluateRisk } from '../services/evaluationService';
import { ArrowLeft, User, Users, FileText, Shield, Upload, Trash2, Download, Edit, Save, X, Eye } from 'lucide-react';
import { DocumentoDTO, PrestatarioDTO } from '../types';
import { getLoanStatusLabel } from '../types/enums';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { RiskEvaluationModal } from '../components/borrowers/RiskEvaluationModal';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';

export function BorrowerDetails() {
  const { dni } = useParams<{ dni: string }>();
  const navigate = useNavigate();
  const borrowerDni = parseInt(dni || '0');
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'info' | 'loans' | 'documents'>('info');
  const [riskResult, setRiskResult] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<PrestatarioDTO>>({});

  // Document Delete State
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);

  // Document Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Queries
  const { data: borrower, isLoading: isLoadingBorrower } = useQuery({
    queryKey: ['borrower', borrowerDni],
    queryFn: () => getBorrowerByDni(borrowerDni),
    enabled: !!borrowerDni,
  });

  const { data: loans } = useQuery({
    queryKey: ['loans'],
    queryFn: getLoans,
  });

  const { data: documents, isLoading: isLoadingDocs } = useQuery({
    queryKey: ['documents', 'Prestatario', borrowerDni],
    queryFn: () => getDocuments('Prestatario', borrowerDni),
    enabled: !!borrowerDni && activeTab === 'documents',
  });

  // Derived state
  const borrowerLoans = loans?.filter(l => l.dniPrestatario === borrowerDni) || [];

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      addToast('Documento subido correctamente', 'success');
    },
    onError: () => {
      addToast('Error al subir el documento', 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      addToast('Documento eliminado correctamente', 'success');
      setDocumentToDelete(null);
    },
    onError: () => {
      addToast('Error al eliminar el documento', 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: PrestatarioDTO) => updateBorrower(borrowerDni, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrower', borrowerDni] });
      queryClient.invalidateQueries({ queryKey: ['borrowers'] });
      setIsEditing(false);
      addToast('Cliente actualizado correctamente', 'success');
    },
    onError: () => {
      addToast('Error al actualizar el cliente', 'error');
    }
  });

  // Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setIsUploadModalOpen(true);
      // Reset input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handleConfirmUpload = async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('Archivo', file);
    formData.append('EntidadTipo', 'Prestatario');
    formData.append('EntidadId', borrowerDni.toString());
    formData.append('TipoDocumento', type);
    
    try {
      await uploadMutation.mutateAsync(formData);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
    } catch (error) {
      // Error is handled by mutation onError
    }
  };

  const handleRiskEval = async (data: any) => {
    if (!borrower) return;
    setIsEvaluating(true);
    try {
      const result = await evaluateRisk({
        cuit: data.cuit,
        montoSolicitado: data.montoSolicitado,
        cuotaEstimada: data.cuotaEstimada,
        ingresoMensual: data.ingresoMensual
      });
      setRiskResult(result);
      setIsRiskModalOpen(false);
    } catch (e) {
      console.error(e);
      addToast('Error al realizar la evaluación de riesgo', 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  const startEdit = () => {
    if (borrower) {
      setEditForm({
        telefono: borrower.telefono,
        domicilio: borrower.domicilio,
        correo: borrower.correo,
        esActivo: borrower.esActivo
      });
      setIsEditing(true);
    }
  };

  const saveEdit = () => {
    if (borrower) {
      updateMutation.mutate({ ...borrower, ...editForm });
    }
  };

  if (isLoadingBorrower) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!borrower) return <div>Cliente no encontrado</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/borrowers')} className="p-2 hover:bg-surfaceHighlight rounded-full text-muted hover:text-main">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-main">{borrower.nombre} {borrower.apellido}</h1>
          <p className="text-muted">DNI: {borrower.dni}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'info' ? 'border-primary-500 text-primary-500' : 'border-transparent text-muted hover:text-main'}`}
        >
          Información
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'loans' ? 'border-primary-500 text-primary-500' : 'border-transparent text-muted hover:text-main'}`}
        >
          Préstamos ({borrowerLoans.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'documents' ? 'border-primary-500 text-primary-500' : 'border-transparent text-muted hover:text-main'}`}
        >
          Documentos
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-xl border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-main flex items-center gap-2">
                  <User className="h-5 w-5 text-primary-500" /> Datos Personales
                </h3>
                {!isEditing ? (
                  <button 
                    onClick={startEdit}
                    className="p-1.5 hover:bg-surfaceHighlight rounded-lg text-muted hover:text-primary-500 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={saveEdit}
                      disabled={updateMutation.isPending}
                      className="p-1.5 hover:bg-green-500/10 rounded-lg text-muted hover:text-green-500 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted">Email:</span> {borrower.correo}</p>
                  <p><span className="text-muted">Teléfono:</span> {borrower.telefono}</p>
                  <p><span className="text-muted">Dirección:</span> {borrower.domicilio}</p>
                  <p><span className="text-muted">Estado:</span> 
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${borrower.esActivo ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {borrower.esActivo ? 'Activo' : 'Inactivo'}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Email</label>
                    <input 
                      type="email"
                      value={editForm.correo || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, correo: e.target.value }))}
                      className="w-full bg-surface/50 border border-border rounded-lg px-3 py-2 text-sm text-main focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Teléfono</label>
                    <input 
                      type="text"
                      value={editForm.telefono || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, telefono: e.target.value }))}
                      className="w-full bg-surface/50 border border-border rounded-lg px-3 py-2 text-sm text-main focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Dirección</label>
                    <input 
                      type="text"
                      value={editForm.domicilio || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, domicilio: e.target.value }))}
                      className="w-full bg-surface/50 border border-border rounded-lg px-3 py-2 text-sm text-main focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-muted">Activo</label>
                    <input 
                      type="checkbox"
                      checked={editForm.esActivo || false}
                      onChange={e => setEditForm(prev => ({ ...prev, esActivo: e.target.checked }))}
                      className="rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-xl border border-border space-y-4">
              <h3 className="font-semibold text-lg text-main flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-500" /> Análisis de Riesgo
              </h3>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsRiskModalOpen(true)}
                  disabled={isEvaluating}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-lg shadow-primary-500/20"
                >
                  Nueva Evaluación
                </button>
              </div>
              
              {riskResult && (
                <div className={`p-4 rounded-xl mt-4 border ${
                  riskResult.estado === 'APROBADO' 
                    ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">{riskResult.estado}</span>
                    {riskResult.montoMaximoSugerido > 0 && (
                      <span className="text-sm font-medium px-2 py-1 bg-surface/50 rounded-lg">
                        Max: ${riskResult.montoMaximoSugerido?.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="font-medium mb-2">{riskResult.motivo}</p>
                  
                  <div className="space-y-1 text-sm opacity-90">
                    <p><span className="font-semibold">BCRA:</span> {riskResult.situacionBcra}</p>
                    <p><span className="font-semibold">Detalle:</span> {riskResult.detalleRiesgo}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-xl border border-border space-y-4">
               <h3 className="font-semibold text-lg text-main flex items-center gap-2">
                 <Users className="h-5 w-5 text-primary-500" /> Datos del Garante
               </h3>
               {(borrower.garanteNombre || borrower.garanteDni) ? (
                 <div className="space-y-2 text-sm">
                   <p><span className="text-muted">Nombre:</span> {borrower.garanteNombre} {borrower.garanteApellido}</p>
                   <p><span className="text-muted">DNI:</span> {borrower.garanteDni}</p>
                   {borrower.garanteCorreo && <p><span className="text-muted">Email:</span> {borrower.garanteCorreo}</p>}
                   {borrower.garanteTelefono && <p><span className="text-muted">Teléfono:</span> {borrower.garanteTelefono}</p>}
                   {borrower.garanteDomicilio && <p><span className="text-muted">Dirección:</span> {borrower.garanteDomicilio}</p>}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-4 text-muted">
                   <p className="italic">No hay garante asignado</p>
                 </div>
               )}
             </div>
          </div>
        )}

        <RiskEvaluationModal
          isOpen={isRiskModalOpen}
          onClose={() => setIsRiskModalOpen(false)}
          onConfirm={handleRiskEval}
          isLoading={isEvaluating}
        />

        {activeTab === 'loans' && (
           <div className="glass-panel rounded-xl overflow-hidden border border-border">
             <table className="w-full text-left text-sm">
               <thead className="bg-surfaceHighlight text-muted">
                 <tr>
                   <th className="px-6 py-3 font-medium">ID</th>
                   <th className="px-6 py-3 font-medium">Monto</th>
                   <th className="px-6 py-3 font-medium">Estado</th>
                   <th className="px-6 py-3 font-medium">Acciones</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border">
                 {borrowerLoans.map(loan => (
                   <tr key={loan.idPrestamo} className="hover:bg-surfaceHighlight/50 transition-colors">
                     <td className="px-6 py-4 font-medium text-main">#{loan.idPrestamo}</td>
                     <td className="px-6 py-4 text-main">${loan.montoOtorgado?.toLocaleString()}</td>
                     <td className="px-6 py-4">
                        <StatusBadge variant={
                          loan.idEstado === 1 ? 'success' : 
                          loan.idEstado === 2 ? 'warning' : 'error'
                        }>
                         {getLoanStatusLabel(loan.idEstado)}
                       </StatusBadge>
                     </td>
                     <td className="px-6 py-4">
                       <button 
                         onClick={() => navigate(`/loans/${loan.idPrestamo}`)}
                         className="text-primary-400 hover:text-primary-300 font-medium hover:underline"
                       >
                         Ver detalles
                       </button>
                     </td>
                   </tr>
                 ))}
                 {borrowerLoans.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-6 py-8 text-center text-muted">
                       Este cliente no tiene préstamos registrados
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="glass-panel p-6 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-main">Documentos del Cliente</h3>
                <label className="cursor-pointer flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary-500/20">
                  <Upload className="h-4 w-4" />
                  Subir Documento
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              {isLoadingDocs ? (
                <div className="text-center py-4">Cargando documentos...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents?.map((doc: DocumentoDTO) => (
                    <div key={doc.idDocumento} className="flex items-center justify-between p-3 bg-surface/50 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary-500" />
                        <div>
                          <p className="font-medium text-main text-sm">{doc.nombreOriginal}</p>
                          <p className="text-xs text-muted">{formatDate(doc.fechaSubida)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button 
                            className="p-1.5 hover:bg-surfaceHighlight rounded-lg text-muted hover:text-main transition-colors"
                            onClick={() => viewDocument(doc.idDocumento)}
                            title="Ver documento"
                         >
                            <Eye className="h-4 w-4" />
                         </button>
                         <button 
                            className="p-1.5 hover:bg-surfaceHighlight rounded-lg text-muted hover:text-main transition-colors"
                            onClick={() => downloadDocument(doc.idDocumento, doc.nombreOriginal)}
                            title="Descargar documento"
                         >
                            <Download className="h-4 w-4" />
                         </button>
                         <button 
                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted hover:text-red-500 transition-colors"
                            onClick={() => setDocumentToDelete(doc.idDocumento)}
                            title="Eliminar documento"
                         >
                            <Trash2 className="h-4 w-4" />
                         </button>
                      </div>
                    </div>
                  ))}
                  {documents?.length === 0 && (
                    <div className="col-span-full py-8 text-center text-muted">
                      No hay documentos subidos
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedFile(null);
        }}
        onUpload={handleConfirmUpload}
        isLoading={uploadMutation.isPending}
        file={selectedFile}
      />

      <ConfirmationModal
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={() => {
          if (documentToDelete) deleteMutation.mutate(documentToDelete);
        }}
        title="Eliminar Documento"
        message="¿Está seguro que desea eliminar este documento? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
