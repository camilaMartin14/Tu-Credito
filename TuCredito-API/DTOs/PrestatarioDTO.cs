using System.ComponentModel.DataAnnotations;

namespace TuCredito.DTOs;
    public class PrestatarioDTO // Datos completos del prestatario y garante
    {
        [Required(ErrorMessage = "El DNI es obligatorio")]
        public int? Dni { get; set; }

        [Required(ErrorMessage = "El Nombre es obligatorio")]
        [StringLength(60, ErrorMessage = "El Nombre no puede exceder los 60 caracteres")]
        public string? Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "El Apellido es obligatorio")]
        [StringLength(60, ErrorMessage = "El Apellido no puede exceder los 60 caracteres")]
        public string? Apellido { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Formato de teléfono inválido")]
        [StringLength(20, ErrorMessage = "El Teléfono no puede exceder los 20 caracteres")]
        public string? Telefono { get; set; } = string.Empty;

        [StringLength(200, ErrorMessage = "El Domicilio no puede exceder los 120 caracteres")]
        public string? Domicilio { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Formato de correo inválido")]
        [StringLength(50, ErrorMessage = "El Correo no puede exceder los 50 caracteres")]
        public string? Correo { get; set; } = string.Empty;

        public bool? EsActivo { get; set; }

        [StringLength(60, ErrorMessage = "El Nombre del Garante no puede exceder los 60 caracteres")]
        public string? GaranteNombre { get; set; }

        [StringLength(60, ErrorMessage = "El Apellido del Garante no puede exceder los 60 caracteres")]
        public string? GaranteApellido { get; set; }

        [Phone(ErrorMessage = "Formato de teléfono del Garante inválido")]
        [StringLength(20, ErrorMessage = "El Teléfono del Garante no puede exceder los 20 caracteres")]
        public string? GaranteTelefono { get; set; }

        [StringLength(120, ErrorMessage = "El Domicilio del Garante no puede exceder los 120 caracteres")]
        public string? GaranteDomicilio { get; set; }

        [EmailAddress(ErrorMessage = "Formato de correo del Garante inválido")]
        [StringLength(100, ErrorMessage = "El Correo del Garante no puede exceder los 100 caracteres")]
        public string? GaranteCorreo { get; set; }
    }
