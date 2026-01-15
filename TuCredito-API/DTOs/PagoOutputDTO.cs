namespace TuCredito.DTOs
{
    public class PagoOutputDTO
    {
        public int IdPago { get; set; }
        public int NroCuota { get; set; }
        public decimal Monto { get; set; }
        public DateTime FecPago { get; set; }
        public int MedioPago { get; set; }
        public required string Estado { get; set; }
    }
}
