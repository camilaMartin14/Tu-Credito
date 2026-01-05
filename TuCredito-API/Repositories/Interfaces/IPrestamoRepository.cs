using TuCredito.Models;
using TuCredito.DTOs;

namespace TuCredito.Repositories.Interfaces
{
    public interface IPrestamoRepository
    {
        Task<bool> SoftDelete(int id);
        Task<bool> PostPrestamo(PrestamoDTO NvoPrestamo);
        Task<PrestamoDTO> GetPrestamoById(int id); 
        Task<List<PrestamoDTO>> GetAllPrestamo();
        Task<List<PrestamoDTO>> GetPrestamoConFiltro(string? nombre, int? estado, int? mesVto, int? anio);
        Task<bool> TienePagosPendientes(int idPrestamo);
    }
}
