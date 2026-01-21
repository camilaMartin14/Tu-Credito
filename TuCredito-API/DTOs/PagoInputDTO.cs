namespace TuCredito.DTOs;
    public class PagoInputDTO
    {
        public int IdCuota { get; set; }
        public int Monto { get; set; }
        public int IdMedioPago { get; set; }
        public string? Observaciones { get; set; }
        public DateTime FecPago { get; set; }
    }
