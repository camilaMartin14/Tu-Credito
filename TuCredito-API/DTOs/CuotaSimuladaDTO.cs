namespace TuCredito.DTOs
{
    public class CuotaSimuladaDTO
    {
        public int NumeroCuota { get; set; }
        public decimal Monto { get; set; }
        public decimal Capital { get; set; }

        public decimal Interes { get; set; }
        public DateTime? FechaVencimiento { get; set; }
    }
}