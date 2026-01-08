namespace TuCredito.DTOs
{
    public class CuotaSimuladaDTO
    {
        public int NumeroCuota { get; set; }
        public decimal Monto { get; set; }
        public DateTime? FechaVencimiento { get; set; }
    }
}