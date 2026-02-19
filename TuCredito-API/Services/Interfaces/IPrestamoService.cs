using TuCredito.DTOs;
using TuCredito.Models;

namespace TuCredito.Services.Interfaces;
    public interface IPrestamoService
    {
        Task<bool> SoftDelete(int id, CancellationToken cancellationToken = default);
        Task<bool> Delete(int id, CancellationToken cancellationToken = default);
        Task<bool> PostPrestamo(PrestamoDTO NvoPrestamo, CancellationToken cancellationToken = default);
        Task<PrestamoDTO> GetPrestamoById(int id, CancellationToken cancellationToken = default);
        Task<Prestamo> GetPrestamoEntityById(int id, CancellationToken cancellationToken = default); 
        Task<List<PrestamoDTO>> GetAll(CancellationToken cancellationToken = default);
        Task<List<PrestamoDTO>> GetPrestamoConFiltro(string? nombre, int? estado, int? mesVto, int? anio, CancellationToken cancellationToken = default);
        Task<ResumenPrestamoDTO> GetResumenPrestamo(int prestamoId, CancellationToken cancellationToken = default);


    }
