using TuCredito.DTOs;
using TuCredito.Models;

namespace TuCredito.Services.Interfaces
{
    public interface IPrestamoService
    {
        Task<bool> SoftDelete(int id);
        Task<bool> PostPrestamo(PrestamoDTO NvoPrestamo);
        Task<PrestamoDTO> GetPrestamoById(int id);
        Task<List<Prestamo>> GetAll();
        Task<List<PrestamoDTO>> GetPrestamoConFiltro(string? nombre, int? estado, int? mesVto, int? anio);
        
    }
}
