using System.ComponentModel.DataAnnotations;

namespace TuCredito.DTOs;

public class PrestatarioFilterDTO
{
    public int? Dni { get; set; }

    [StringLength(60, ErrorMessage = "El Nombre no puede exceder los 60 caracteres")]
    public string? Nombre { get; set; }

    [StringLength(60, ErrorMessage = "El Apellido no puede exceder los 60 caracteres")]
    public string? Apellido { get; set; }

    [Phone(ErrorMessage = "Formato de teléfono inválido")]
    [StringLength(20, ErrorMessage = "El Teléfono no puede exceder los 20 caracteres")]
    public string? Telefono { get; set; }

    [StringLength(200, ErrorMessage = "El Domicilio no puede exceder los 120 caracteres")]
    public string? Domicilio { get; set; }

    [EmailAddress(ErrorMessage = "Formato de correo inválido")]
    [StringLength(50, ErrorMessage = "El Correo no puede exceder los 50 caracteres")]
    public string? Correo { get; set; }

    public bool? EsActivo { get; set; }
}
