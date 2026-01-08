using TuCredito.DTOs;
using TuCredito.Models;

namespace TuCredito.Services.Interfaces
{
    public interface IPrestamoService
    {
        Task<bool> SoftDelete(int id);
        Task<bool> PostPrestamo(PrestamoDTO NvoPrestamo);
        Task<PrestamoDTO> GetPrestamoById(int id);
        Task<IEnumerable<Prestamo>> GetAll(int page, int pageSize);
        Task<List<PrestamoDTO>> GetPrestamoConFiltro(string? nombre, int? estado, int? mesVto, int? anio);
        
    }
}
