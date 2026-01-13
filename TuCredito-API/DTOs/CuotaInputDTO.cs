namespace TuCredito.DTOs
{
    public class CuotaInputDTO
    {
        public int IdPrestamo { get; set; }
        public int NroCuota { get; set; }
        public decimal Monto { get; set; }
        public  decimal Interes { get; set; }
        public DateTime FecVto { get; set; }
    }
}
