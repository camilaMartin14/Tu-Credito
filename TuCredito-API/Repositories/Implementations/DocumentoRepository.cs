using Microsoft.EntityFrameworkCore;
using TuCredito.Models;
using TuCredito.Models.Documentos;
using TuCredito.Repositories.Interfaces;

namespace TuCredito.Repositories.Implementations
{
    public class DocumentoRepository : IDocumentoRepository
    {
        private readonly TuCreditoContext _context;

        public DocumentoRepository(TuCreditoContext context)
        {
            _context = context;
        }

        public async Task AgregarAsync(Models.Documento documento)
        {
            _context.Documentos.Add(documento);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Models.Documento>> ListarAsync(string entidadTipo, int entidadId)
        {
            return await _context.Documentos
                .Where(d => d.EntidadTipo == entidadTipo && d.EntidadId == entidadId && d.Activo)
                .OrderByDescending(d => d.FechaSubida)
                .ToListAsync();
        }

        public async Task<Models.Documento?> ObtenerPorIdAsync(int idDocumento)
        {
            return await _context.Documentos
                .FirstOrDefaultAsync(d => d.IdDocumento == idDocumento && d.Activo);
        }

        public async Task ActualizarAsync(Models.Documento documento)
        {
            _context.Documentos.Update(documento);
            await _context.SaveChangesAsync();
        }

        public Task AgregarAsync(Models.Documentos.Documento documento)
        {
            throw new NotImplementedException();
        }

        Task<Models.Documentos.Documento?> IDocumentoRepository.ObtenerPorIdAsync(int idDocumento)
        {
            throw new NotImplementedException();
        }

        Task<List<Models.Documentos.Documento>> IDocumentoRepository.ListarAsync(string entidadTipo, int entidadId)
        {
            throw new NotImplementedException();
        }

        public Task ActualizarAsync(Models.Documentos.Documento documento)
        {
            throw new NotImplementedException();
        }
    }
}
