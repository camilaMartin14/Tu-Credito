using TuCredito.Models;

namespace TuCredito.Repositories.Interfaces
{
    public interface IDocumentoRepository
    {
        Task AgregarAsync(Documento documento);
        Task<Documento?> ObtenerPorIdAsync(int idDocumento);
        Task<List<Documento>> ListarAsync(string entidadTipo, int entidadId);
        Task ActualizarAsync(Documento documento);
    }
}
