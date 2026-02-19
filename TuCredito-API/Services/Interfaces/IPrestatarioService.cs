using TuCredito.DTOs;
using TuCredito.Models;

namespace TuCredito.Services.Interfaces;
    public interface IPrestatarioService
    {
        Task<int> CrearAsync(Prestatario prestatario, CancellationToken cancellationToken = default);
        Task<Prestatario?> ObtenerPorDniAsync(int dni, CancellationToken cancellationToken = default);
        Task<List<Prestatario>> ObtenerConFiltrosAsync(PrestatarioDTO filtro, CancellationToken cancellationToken = default);
        Task<bool> ActualizarAsync(Prestatario prestatario, CancellationToken cancellationToken = default);
        Task<bool> CambiarEstadoAsync(int dni, bool activo, CancellationToken cancellationToken = default);
    }
