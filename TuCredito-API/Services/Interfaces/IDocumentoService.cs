using TuCredito.DTOs.Documentos;

namespace TuCredito.Services.Interfaces
{
    public interface IDocumentoService
    {
        Task SubirAsync(SubirDocumentoRequestDTO request);
        Task<List<RespuestaDocumentoDto>> ListarAsync(string entidadTipo, int entidadId);
        Task<(Stream Stream, string ContentType, string NombreOriginal)> DescargarAsync(int idDocumento);
        Task EliminarAsync(int idDocumento);
    }
}
