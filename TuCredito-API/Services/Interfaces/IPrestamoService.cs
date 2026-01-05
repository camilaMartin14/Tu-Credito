using TuCredito.DTOs;

namespace TuCredito.Services.Interfaces
{
    public interface IPrestamoService
    {
        Task<bool> SoftDelete(int id);
        Task<bool> PostPrestamo(PrestamoDTO NvoPrestamo);
        Task<PrestamoDTO> GetPrestamoById(int id);
        Task<List<PrestamoDTO>> GetAllPrestamo();
        Task<List<PrestamoDTO>> GetPrestamoConFiltro(string? nombre, int? estado, int? mesVto, int? anio);
        
    }
}
