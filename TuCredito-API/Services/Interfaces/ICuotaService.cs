using TuCredito.Models;

namespace TuCredito.Services.Interfaces
{
    public interface ICuotaService
    {
        Task<Cuota> GetById(int id);
        Task<List<Cuota>> GetByFiltro(int? estado, int? mesVto, string? prestatario);
        Task<bool> AddCuota(Cuota cuota); // agregaria la clonada y la q opera como multa 
        Task<bool> RecalcularEstado(Cuota cuota); // reprogramada - softdelete
    }
}
