using TuCredito.Models;

namespace TuCredito.Repositories.Interfaces;

public interface ICuotaRepository
{
    Task<Cuota?> GetById(int id);
    Task<List<Cuota>> GetByFiltro(int? estado, int? mesVto, string? prestatario);
    Task<int> AddCuota(Cuota cuota); // agregaria la clonada y la q opera como multa 
    //Task<bool> UpdateCuota(int idCuota, int? nvoEstado, int? monto); // saldada, pendiente, reprogramada. nvo monto en caso de pago parcial 
    Task<Cuota> GetUltimaPendiente(int IdPrestamo);
    Task<bool> UpdateCuota(Cuota cuota);
    Task<List<Cuota>> GetAll(int idPrestamo);
}
