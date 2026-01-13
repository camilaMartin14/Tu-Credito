using TuCredito.Models;

namespace TuCredito.DTOs
{
    public class PrestamoDTO
    {
        public int DniPrestatario { get; set; }
        public string NombrePrestatario { get; set; }

        public decimal MontoOtorgado { get; set; }

        public int CantidadCtas { get; set; } 

        public int IdEstado { get; set; }
        public DateTime FechaOtorgamiento { get; set; }
        public DateTime Fec1erVto { get; set; }
        public int IdSistAmortizacion {  get; set; }
        public decimal TasaInteres {  get; set; }   


    }
}
