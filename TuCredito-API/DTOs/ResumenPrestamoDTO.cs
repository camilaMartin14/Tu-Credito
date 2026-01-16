namespace TuCredito.DTOs
{
    public class ResumenPrestamoDTO
    {
        public int IdPrestamo { get; set; }
        public int CantidadCuotasOriginales { get; set; } 
        public int CantidadCuotasEfectivas { get; set; }  
        public int MesesActivo { get; set; }
        public int EstadoPrestamo { get; set; }
    }
}
