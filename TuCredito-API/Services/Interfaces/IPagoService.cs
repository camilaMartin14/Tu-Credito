using TuCredito.Models;
using TuCredito.DTOs;

namespace TuCredito.Services.Interfaces
{
    public interface IPagoService
    {
        Task<List<Pago>> GetAllPagos();
        Task<Pago> GetPagoById(int id);
        Task<List<PagoOutputDTO>> GetPagoConFiltro(string? nombre, int? mes);
        Task<bool> NewPago(Pago pago);
        Task<bool> UpdatePago(int id, string estado);
        Task<bool> RegistrarPagoAnticipadoAsync(Pago pago);
    }
}
