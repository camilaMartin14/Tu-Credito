using TuCredito.DTOs;
using TuCredito.Models;

namespace TuCredito.Services.Interfaces;
    public interface IPrestamistaService
    {
        Task<Prestamista?> LoginAsync(string email, string contrasenia, CancellationToken cancellationToken = default);
        Task<Prestamista?> ObtenerPrestamistaPorEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<Prestamista?> ObtenerPrestamistaPorIdAsync(int idPrestamista, CancellationToken cancellationToken = default);
        Task<int> RegistrarPrestamistaAsync(PrestamistaRegisterDto dto, CancellationToken cancellationToken = default);
        Task<int> ObtenerIdUsuarioLogueado(CancellationToken cancellationToken = default);
        Task<bool> UpdatePerfilAsync(int id, PrestamistaUpdateDTO dto, CancellationToken cancellationToken = default);
    }
