using TuCredito.DTOs;
using TuCredito.Models;

namespace TuCredito.Services.Interfaces
{
    public interface IPrestamistaService
    {
        Task<Prestamista?> LoginAsync(string email, string contrasenia);
        Task<Prestamista?> ObtenerPrestamistaPorEmailAsync(string email);
        Task<Prestamista?> ObtenerPrestamistaPorIdAsync(int idPrestamista);
        Task<int> RegistrarPrestamistaAsync(PrestamistaRegisterDto dto);
    }
}
