using TuCredito.Models;
using TuCredito.DTOs;

namespace TuCredito.Services.Interfaces;
    public interface IPagoService
    {
        Task<List<Pago>> GetAllPagos(CancellationToken cancellationToken = default);
        Task<Pago> GetPagoById(int id, CancellationToken cancellationToken = default);       
        Task<List<Pago>> GetPagoByIdPrestamo(int id, CancellationToken cancellationToken = default);
        Task<List<PagoOutputDTO>> GetPagoConFiltro(string? nombre, int? mes, CancellationToken cancellationToken = default);
        Task<bool> NewPago(Pago pago, CancellationToken cancellationToken = default);
        Task<bool> UpdatePago(int id, string estado, CancellationToken cancellationToken = default);
        Task<bool> RegistrarPagoAnticipadoAsync(Pago pago, CancellationToken cancellationToken = default);
    }
