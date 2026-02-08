namespace TuCredito.DTOs;
    public class PagoOutputDTO
    {
        public int IdPago { get; set; }
        public int NroCuota { get; set; }
        public int CantidadTotalCuotas { get; set; }
        public decimal Monto { get; set; }
        public DateTime FecPago { get; set; }
        public int MedioPago { get; set; }
        public required string Estado { get; set; }
        public string NombreCliente { get; set; }
        public string ApellidoCliente { get; set; }
        public int DniCliente { get; set; }
    }
