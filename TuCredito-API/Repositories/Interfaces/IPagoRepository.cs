using TuCredito.Models;
using TuCredito.DTOs;

namespace TuCredito.Repositories.Interfaces
{
    public interface IPagoRepository
    {
        Task<List<Pago>> GetAllPagos();
        Task<Pago> GetPagoById(int id);
        Task<List<Pago>> GetPagoByIdPrestamo(int id);
        Task<List<PagoOutputDTO>> GetPagoConFiltro(string? nombre, int? mes);
        Task<bool> NewPago(Pago pago);
        Task<bool> UpdatePago(int id, string estado); // en caso de errores solo se permite eliminar y registrar uno nuevo 
                                                     // en caso de eliminacion revisar el estado de la cuota, por si ocurre algun cambio automatico 
    }
}
