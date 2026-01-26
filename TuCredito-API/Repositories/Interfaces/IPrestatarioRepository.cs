using System.Threading.Tasks;
using TuCredito.DTOs;
using TuCredito.Models;

namespace TuCredito.Repositories.Interfaces;
    public interface IPrestatarioRepository
    {
        Task<int> CrearAsync(Prestatario prestatario);
        Task<Prestatario?> ObtenerPorDniAsync(int dni);
        Task<List<Prestatario>> ObtenerConFiltrosAsync(PrestatarioDTO filtro);
        Task<bool> ActualizarAsync(Prestatario prestatario);
        Task<bool> CambiarEstadoAsync(int dni, bool activo);
    }
