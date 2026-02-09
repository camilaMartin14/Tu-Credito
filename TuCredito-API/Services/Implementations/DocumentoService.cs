using Microsoft.EntityFrameworkCore;
using TuCredito.DTOs.Documentos;
using TuCredito.MinIO;
using TuCredito.Models;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations
{
    public class DocumentoService : IDocumentoService
    {
        private readonly TuCreditoContext _context;
        private readonly IFileStorage _fileStorage;

        public DocumentoService(TuCreditoContext context, IFileStorage fileStorage)
        {
            _context = context;
            _fileStorage = fileStorage;
        }

        public async Task SubirAsync(SubirDocumentoRequestDTO request)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));
            if (request.EntidadId <= 0) throw new ArgumentException("El ID de la entidad es inv�lido.");
            if (string.IsNullOrWhiteSpace(request.EntidadTipo)) throw new ArgumentException("El tipo de entidad es obligatorio.");
            if (string.IsNullOrWhiteSpace(request.TipoDocumento)) throw new ArgumentException("El tipo de documento es obligatorio.");
            if (request.Archivo == null || request.Archivo.Length == 0) throw new ArgumentException("El archivo es obligatorio.");

            const long MAX_SIZE = 5 * 1024 * 1024; // 5MB
            if (request.Archivo.Length > MAX_SIZE)
                throw new ArgumentException("El archivo excede el tamaño máximo permitido (5MB).");

            var allowedTypes = new[] { "application/pdf", "image/jpeg", "image/png", "image/jpg" };
            if (!allowedTypes.Contains(request.Archivo.ContentType.ToLower()))
                throw new ArgumentException("Formato de archivo no válido. Solo PDF, JPEG y PNG.");

            if (request.UsuarioId == 1) // ID 1 es demo según seed_data
            {
                var count = await _context.Documentos.CountAsync(d => d.SubidoPor == 1 && d.Activo);
                if (count >= 10)
                    throw new InvalidOperationException("La cuenta DEMO ha alcanzado el límite de archivos (10).");
            }

            await ValidarEntidadAsync(request.EntidadTipo, request.EntidadId);

            var ruta = $"{request.EntidadTipo.ToLower()}/" +
                       $"{request.EntidadId}/" +
                       $"{request.TipoDocumento.ToLower()}/" +
                       $"{Guid.NewGuid()}_{request.Archivo.FileName}";

            using var stream = request.Archivo.OpenReadStream();
            await _fileStorage.SubirAsync(stream, ruta, request.Archivo.ContentType);

            var documento = new Documento
            {
                EntidadTipo = request.EntidadTipo,
                EntidadId = request.EntidadId,
                TipoDocumento = request.TipoDocumento,
                NombreOriginal = request.Archivo.FileName,
                RutaStorage = ruta,
                ContentType = request.Archivo.ContentType,
                SubidoPor = request.UsuarioId,
                FechaSubida = DateTime.UtcNow,
                Activo = true
            };

            _context.Documentos.Add(documento);
            await _context.SaveChangesAsync();
        }

        public async Task<List<RespuestaDocumentoDto>> ListarAsync(string entidadTipo, int entidadId)
        {
            if (entidadId <= 0) throw new ArgumentException("El ID de la entidad es inv�lido.");
            if (string.IsNullOrWhiteSpace(entidadTipo)) throw new ArgumentException("El tipo de entidad es obligatorio.");

            await ValidarEntidadAsync(entidadTipo, entidadId);

            var documentos = await _context.Documentos
                .Where(d => d.EntidadTipo == entidadTipo && d.EntidadId == entidadId && d.Activo)
                .OrderByDescending(d => d.FechaSubida)
                .ToListAsync();

            return documentos.Select(d => new RespuestaDocumentoDto
            {
                IdDocumento = d.IdDocumento,
                TipoDocumento = d.TipoDocumento,
                NombreOriginal = d.NombreOriginal,
                FechaSubida = d.FechaSubida
            }).ToList();
        }

        public async Task<(Stream Stream, string ContentType, string NombreOriginal)> DescargarAsync(int idDocumento)
        {
            if (idDocumento <= 0) throw new ArgumentException("ID de documento inv�lido.");

            var documento = await _context.Documentos
                .FirstOrDefaultAsync(d => d.IdDocumento == idDocumento && d.Activo);

            if (documento == null)
                throw new Exception("Documento no encontrado.");

            var stream = await _fileStorage.DescargarAsync(documento.RutaStorage);

            return (stream, documento.ContentType, documento.NombreOriginal);
        }

        public async Task EliminarAsync(int idDocumento)
        {
            if (idDocumento <= 0) throw new ArgumentException("ID de documento inválido.");

            var documento = await _context.Documentos
                .FirstOrDefaultAsync(d => d.IdDocumento == idDocumento);

            if (documento == null)
                throw new Exception("Documento no encontrado.");

            // Hard Delete: Eliminar archivo físico de MinIO y registro de BD
            await _fileStorage.EliminarAsync(documento.RutaStorage);
            
            _context.Documentos.Remove(documento);
            await _context.SaveChangesAsync();
        }

        private async Task ValidarEntidadAsync(string entidadTipo, int entidadId)
        {
            var tipo = entidadTipo.Trim().ToLower();

            switch (tipo)
            {
                case "prestatario":
                    {
                        // Ajust� el DbSet/nombre si tu contexto lo llama distinto
                        var existe = await _context.Prestatarios.AnyAsync(p => p.Dni == entidadId);
                        if (!existe)
                            throw new Exception($"Prestatario con ID {entidadId} no encontrado.");
                        break;
                    }

                case "prestamo":
                    {
                        var existe = await _context.Prestamos.AnyAsync(p => p.IdPrestamo == entidadId);
                        if (!existe)
                            throw new Exception($"Pr�stamo con ID {entidadId} no encontrado.");
                        break;
                    }

                default:
                    throw new Exception($"Tipo de entidad '{entidadTipo}' no soportado.");
            }
        }
    }
}
