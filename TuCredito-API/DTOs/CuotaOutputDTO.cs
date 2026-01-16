using TuCredito.Models;
using TuCredito.Models.Enums;

namespace TuCredito.DTOs
{
    public class CuotaOutputDTO
    {
        public int Monto { get; set; }
        public int NroCta { get; set; }
        public DateTime Vto { get; set; }
        public EstadoCuota Estado { get; set; }
        public bool EstaVencida {  get; set; }
    }
}
