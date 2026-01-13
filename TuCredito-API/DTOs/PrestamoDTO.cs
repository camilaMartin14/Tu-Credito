using TuCredito.Models;

namespace TuCredito.DTOs
{
    public class PrestamoDTO
    {
        public int DniPrestatario { get; set; }
        public string NombrePrestatario { get; set; }

        public decimal MontoOtorgado { get; set; }

        public int CantidadCtas { get; set; } 

<<<<<<< HEAD
        public int IdEstado { get; set; }
        public DateTime FechaOtorgamiento { get; set; }
        public DateTime Fec1erVto { get; set; }
        public int IdSistAmortizacion {  get; set; }
        public decimal TasaInteres {  get; set; }   


=======
        public int IdEstado { get; set; }    
>>>>>>> 6019ec3a5a100a570682392315ff7b5220de3047
    }
}
