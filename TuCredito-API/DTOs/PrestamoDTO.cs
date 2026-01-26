
using System.ComponentModel.DataAnnotations;

namespace TuCredito.DTOs;
    public class PrestamoDTO
    {
        [Required(ErrorMessage = "El DNI del Prestatario es obligatorio")]
        public int DniPrestatario { get; set; }

        [Required(ErrorMessage = "El Nombre del Prestatario es obligatorio")]
        [StringLength(60, ErrorMessage = "El Nombre del Prestatario no puede exceder los 60 caracteres")]
        public required string NombrePrestatario { get; set; }

        [Required(ErrorMessage = "El Monto Otorgado es obligatorio")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El Monto Otorgado debe ser mayor a 0")]
        public decimal MontoOtorgado { get; set; }

        [Required(ErrorMessage = "La Cantidad de Cuotas es obligatoria")]
        [Range(1, 120, ErrorMessage = "La Cantidad de Cuotas debe estar entre 1 y 120")]
        public int CantidadCtas { get; set; } 

        [Required(ErrorMessage = "El IdEstado es obligatorio")]
        public int IdEstado { get; set; }

        [Required(ErrorMessage = "La Fecha de Otorgamiento es obligatoria")]
        public DateTime FechaOtorgamiento { get; set; }

        [Required(ErrorMessage = "La Fecha del Primer Vencimiento es obligatoria")]
        public DateTime Fec1erVto { get; set; }

        [Required(ErrorMessage = "El Sistema de Amortización es obligatorio")]
        public int IdSistAmortizacion {  get; set; }

        [Required(ErrorMessage = "La Tasa de Interés es obligatoria")]
        [Range(0, 1000, ErrorMessage = "La Tasa de Interés debe ser un valor positivo")]
        public decimal TasaInteres {  get; set; }   
    }
