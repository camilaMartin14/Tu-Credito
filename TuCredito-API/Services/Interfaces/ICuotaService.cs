using TuCredito.Models;
using TuCredito.DTOs;

namespace TuCredito.Services.Interfaces
{
    public interface ICuotaService
    {
        Task<Cuota> GetById(int id);
        Task<List<Cuota>> GetByFiltro(int? estado, int? mesVto, string? prestatario);
        Task<bool> AddCuota(Cuota cuota); // agregaria la clonada y la q opera como multa 
        Task<bool> UpdateCuota(Cuota cuota); // reprogramada - softdelete
        Task<int> ActualizarCuotasVencidas();
        Task<List<Cuota>> Getall(int idPrestamo); // todas las cuotas de ese prestamo
    }
}
