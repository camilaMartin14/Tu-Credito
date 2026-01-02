using TuCredito.DTOs;
using TuCredito.Models;

namespace TuCredito.Services.Interfaces
{
    public interface IPrestatarioService
    {
        Task<int> CrearAsync(Prestatario prestatario);
        Task<Prestatario?> ObtenerPorDniAsync(int dni);
        Task<List<Prestatario>> ObtenerConFiltrosAsync(PrestatarioDTO filtro);
        Task<bool> ActualizarAsync(Prestatario prestatario);
        Task<bool> CambiarEstadoAsync(int dni, bool activo);
    }
}
