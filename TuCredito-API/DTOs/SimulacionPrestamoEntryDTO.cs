using System.ComponentModel.DataAnnotations;

namespace TuCredito.Controllers;
    public class SimulacionPrestamoEntryDTO
    {
        [Required(ErrorMessage = "El Monto del Préstamo es obligatorio")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El Monto del Préstamo debe ser mayor a 0")]
        public decimal MontoPrestamo { get; set; }  // solicitado

        [Required(ErrorMessage = "La Cantidad de Cuotas es obligatoria")]
        [Range(1, 120, ErrorMessage = "La Cantidad de Cuotas debe estar entre 1 y 120")]
        public int CantidadCuotas { get; set; }

        [Required(ErrorMessage = "El Interés Mensual es obligatorio")]
        [Range(0, 100, ErrorMessage = "El Interés Mensual debe ser un valor positivo")]
        public decimal InteresMensual { get; set; }  //  (ej: 0.05 = 5%)

        public DateTime? FechaInicio { get; set; }    
        public int? RedondeoMultiplo { get; set; } 
    }
