using TuCredito.DTOs.Documentos;

namespace TuCredito.Services.Interfaces;
    public interface IDocumentoService
    {
        Task SubirAsync(SubirDocumentoRequestDTO request, CancellationToken cancellationToken = default);
        Task<List<RespuestaDocumentoDto>> ListarAsync(string entidadTipo, int entidadId, CancellationToken cancellationToken = default);
        Task<(Stream Stream, string ContentType, string NombreOriginal)> DescargarAsync(int idDocumento, CancellationToken cancellationToken = default);
        Task EliminarAsync(int idDocumento, CancellationToken cancellationToken = default);
    }
