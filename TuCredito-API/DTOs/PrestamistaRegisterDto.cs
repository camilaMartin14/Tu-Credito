using System.ComponentModel.DataAnnotations;

namespace TuCredito.DTOs;
    public class PrestamistaRegisterDto
    {
        [Required(ErrorMessage = "El Nombre es obligatorio")]
        [StringLength(60, ErrorMessage = "El Nombre no puede exceder los 60 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "El Apellido es obligatorio")]
        [StringLength(60, ErrorMessage = "El Apellido no puede exceder los 60 caracteres")]
        public string Apellido { get; set; } = string.Empty;

        [Required(ErrorMessage = "El Correo es obligatorio")]
        [EmailAddress(ErrorMessage = "Formato de correo inválido")]
        [StringLength(50, ErrorMessage = "El Correo no puede exceder los 50 caracteres")]
        public string Correo { get; set; } = string.Empty;

        [Required(ErrorMessage = "El Usuario es obligatorio")]
        [StringLength(10, ErrorMessage = "El Usuario no puede exceder los 10 caracteres")]
        public string Usuario { get; set; } = string.Empty;

        [Required(ErrorMessage = "La Contraseña es obligatoria")]
        [StringLength(32, MinimumLength = 6, ErrorMessage = "La Contraseña debe tener entre 6 y 35 caracteres")]
        public string Contrasenia { get; set; } = string.Empty;
    }
