namespace TuCredito.DTOs.Dashboard
{
    public class CuotaVencerDTO
    {
        public string Cliente { get; set; } = string.Empty;
        public DateTime FechaVencimiento { get; set; }
        public decimal Monto { get; set; }
        public int DiasParaVencer { get; set; }
    }
}
