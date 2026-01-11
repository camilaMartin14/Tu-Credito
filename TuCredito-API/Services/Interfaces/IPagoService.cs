using TuCredito.Models;

namespace TuCredito.Services.Interfaces
{
    public interface IPagoService
    {
        Task<List<Pago>> GetAllPagos();
        Task<Pago> GetPagoById(int id);
        Task<List<Pago>> GetPagoConFiltro(string? nombre, int? mes);
        Task<bool> NewPago(Pago pago);
        Task<bool> UpdatePago(int id, string estado);
        Task<bool> RegistrarPagoAnticipadoAsync(Pago pago);
    }
}
