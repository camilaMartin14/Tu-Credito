using System.ComponentModel.DataAnnotations;

namespace TuCredito.DTOs;
    public class PrestamistaUpdateDTO
    {
        [StringLength(60, ErrorMessage = "El Nombre no puede exceder los 60 caracteres")]
        public string? Nombre { get; set; }

        [StringLength(60, ErrorMessage = "El Apellido no puede exceder los 60 caracteres")]
        public string? Apellido { get; set; }

        [EmailAddress(ErrorMessage = "Formato de correo inválido")]
        [StringLength(50, ErrorMessage = "El Email no puede exceder los 50 caracteres")]
        public string? Email { get; set; }

        [StringLength(10, ErrorMessage = "El Usuario no puede exceder los 10 caracteres")]
        public string? Usuario { get; set; }

        [StringLength(32, ErrorMessage = "La Contraseña no puede exceder los 32 caracteres")]
        public string? ContraseniaActual { get; set; }

        [StringLength(32, MinimumLength = 8, ErrorMessage = "La Nueva Contraseña debe tener entre 8 y 32 caracteres")]
        [RegularExpression(@"^(?=.*[0-9]).*$", ErrorMessage = "La nueva contraseña debe contener al menos un número")]
        public string? NuevaContrasenia { get; set; }
    }
