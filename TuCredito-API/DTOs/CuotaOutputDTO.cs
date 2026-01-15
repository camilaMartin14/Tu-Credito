namespace TuCredito.DTOs
{
    public class CuotaOutputDTO
    {
        public int Monto { get; set; }
        public int NroCta { get; set; }
        public DateTime Vto { get; set; }
        public required string Estado { get; set; }
    }
}
