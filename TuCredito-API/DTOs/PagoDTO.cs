namespace TuCredito.DTOs
{
    public class PagoDTO
    {
        public int NroCta { get; set; } // NRO DE CTA DEL PRESTAMO ESPECIFICO 
        public int Monto { get; set; }
        public DateTime FechaDePago { get; set; }
    }
}
