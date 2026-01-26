using TuCredito.DTOs.Documentos;
using TuCredito.MinIO;
using TuCredito.Models;
using TuCredito.Repositories.Interfaces;

using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations;
    public class DocumentoService : IDocumentoService
    {
        private readonly IDocumentoRepository _documentoRepo;
        private readonly IFileStorage _fileStorage;
        private readonly IPrestatarioRepository _clienteRepo;
        private readonly IPrestamoRepository _prestamoRepo;

        public DocumentoService(
            IDocumentoRepository documentoRepo,
            IFileStorage fileStorage,
            IPrestatarioRepository clienteRepo,
            IPrestamoRepository prestamoRepo)
        {
            _documentoRepo = documentoRepo;
            _fileStorage = fileStorage;
            _clienteRepo = clienteRepo;
            _prestamoRepo = prestamoRepo;
        }

        public async Task SubirAsync(SubirDocumentoRequestDTO request)
        {
            await ValidarEntidadAsync(request.EntidadTipo, request.EntidadId);

            var ruta = $"{request.EntidadTipo.ToLower()}/" +
                       $"{request.EntidadId}/" +
                       $"{request.TipoDocumento.ToLower()}/" +
                       $"{Guid.NewGuid()}_{request.Archivo.FileName}"; 

            using var stream = request.Archivo.OpenReadStream();
            await _fileStorage.SubirAsync(
                stream,
                ruta,
                request.Archivo.ContentType);

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

            await _documentoRepo.AgregarAsync(documento);
        }

        public async Task<List<RespuestaDocumentoDto>> ListarAsync(
            string entidadTipo,
            int entidadId)
        {
            await ValidarEntidadAsync(entidadTipo, entidadId);

            var documentos = await _documentoRepo
                .ListarAsync(entidadTipo, entidadId);

            return documentos
                .Select(d => new RespuestaDocumentoDto
                {
                    IdDocumento = d.IdDocumento,
                    TipoDocumento = d.TipoDocumento,
                    NombreOriginal = d.NombreOriginal,
                    FechaSubida = d.FechaSubida
                })
                .ToList();
        }

        public async Task<(Stream Stream, string ContentType, string NombreOriginal)>
            DescargarAsync(int idDocumento)
        {
            var documento = await _documentoRepo
                .ObtenerPorIdAsync(idDocumento)
                ?? throw new Exception("Documento no encontrado");

            var stream = await _fileStorage
                .DescargarAsync(documento.RutaStorage);

            return (stream, documento.ContentType, documento.NombreOriginal);
        }

        public async Task EliminarAsync(int idDocumento)
        {
            var documento = await _documentoRepo.ObtenerPorIdAsync(idDocumento);
            if (documento == null)
                throw new Exception("Documento no encontrado");

            // Soft delete in DB
            documento.Activo = false;
            await _documentoRepo.ActualizarAsync(documento);
        }

        private async Task ValidarEntidadAsync(
            string entidadTipo,
            int entidadId)
        {
            switch (entidadTipo.ToLower())
            {
                case "prestatario":
                    var prestatario = await _clienteRepo.ObtenerPorDniAsync(entidadId);
                    if (prestatario == null)
                        throw new Exception($"Prestatario con ID {entidadId} no encontrado.");
                    break;
                case "prestamo":
                    var prestamo = await _prestamoRepo.GetPrestamoById(entidadId);
                    if (prestamo == null)
                        throw new Exception($"Prestamo con ID {entidadId} no encontrado.");
                    break;
                default:
                    throw new Exception($"Tipo de entidad '{entidadTipo}' no soportado.");
            }
        }
    }
