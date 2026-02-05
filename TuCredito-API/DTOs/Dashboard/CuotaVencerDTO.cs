namespace TuCredito.DTOs.Dashboard;
    public class CuotaVencerDTO
    {
        public int IdCuota { get; set; }
        public int IdPrestamo { get; set; }
        public int NroCuota { get; set; }
        public string NombrePrestatario { get; set; } = string.Empty;
        public string ApellidoPrestatario { get; set; } = string.Empty;
        public int DniPrestatario { get; set; }
        public DateTime FechaVencimiento { get; set; }
        public decimal Monto { get; set; }
        public int DiasParaVencer { get; set; }
    }
