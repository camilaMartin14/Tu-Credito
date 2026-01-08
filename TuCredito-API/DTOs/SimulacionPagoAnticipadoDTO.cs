using TuCredito.Controllers;

namespace TuCredito.DTOs
{
    public class SimulacionPagoAnticipadoDTO
    {
        public SimulacionPrestamoOutputDTO Simulacion { get; set; }
        public decimal MontoAnticipado { get; set; }
    }
}
