using System.ComponentModel.DataAnnotations;

namespace TuCredito.DTOs;
    public class PagoInputDTO
    {
        [Required(ErrorMessage = "El IdCuota es obligatorio")]
        public int IdCuota { get; set; }

        [Required(ErrorMessage = "El Monto es obligatorio")]
        [Range(1, int.MaxValue, ErrorMessage = "El Monto debe ser mayor a 0")]
        public int Monto { get; set; }

        [Required(ErrorMessage = "El IdMedioPago es obligatorio")]
        public int IdMedioPago { get; set; }

        [StringLength(300, ErrorMessage = "Las observaciones no pueden exceder los 300 caracteres")]
        public string? Observaciones { get; set; }

        [Required(ErrorMessage = "La Fecha de pago es obligatoria")]
        public DateTime FecPago { get; set; }
    }
