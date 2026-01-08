namespace TuCredito.Controllers
{
    public class SimulacionPrestamoEntryDTO
    {
        public decimal MontoPrestamo { get; set; }  // solicitado
        public int CantidadCuotas { get; set; }
        public decimal InteresMensual { get; set; }  //  (ej: 0.05 = 5%)
        public DateTime? FechaInicio { get; set; }    
        public int? RedondeoMultiplo { get; set; } 
    }
}
