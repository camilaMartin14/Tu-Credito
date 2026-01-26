using System.ComponentModel.DataAnnotations;

namespace TuCredito.DTOs.Documentos;
    public class SubirDocumentoRequestDTO
    {
        [Required(ErrorMessage = "El Tipo de Entidad es obligatorio")]
        [StringLength(50, ErrorMessage = "El Tipo de Entidad no puede exceder los 50 caracteres")]
        public string EntidadTipo { get; set; } = null!;

        [Required(ErrorMessage = "El Id de Entidad es obligatorio")]
        public int EntidadId { get; set; }

        [Required(ErrorMessage = "El Tipo de Documento es obligatorio")]
        [StringLength(50, ErrorMessage = "El Tipo de Documento no puede exceder los 50 caracteres")]
        public string TipoDocumento { get; set; } = null!;

        [Required(ErrorMessage = "El Archivo es obligatorio")]
        public IFormFile Archivo { get; set; } = null!;

        [Required(ErrorMessage = "El Id de Usuario es obligatorio")]
        public int UsuarioId { get; set; }
    }
