namespace TuCredito.DTOs.Dashboard
{
    public class MorosidadDetalleDTO
    {
        public string Cliente { get; set; } = string.Empty;
        public DateTime FechaVencimiento { get; set; }
        public int DiasAtraso { get; set; }
        public decimal MontoAdeudado { get; set; }
    }
}
