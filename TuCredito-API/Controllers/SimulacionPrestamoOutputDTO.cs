namespace TuCredito.Controllers
{
    public class SimulacionPrestamoOutputDTO
    {
        public decimal MontoCuota { get; set; }
        public decimal TotalAPagar { get; set; }

        // Pago anticipado
        public decimal? NuevoTotalAPagar { get; set; }
        public decimal? AhorroPorPagoAnticipado { get; set; }
    }
}
