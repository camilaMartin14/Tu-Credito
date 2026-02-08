namespace TuCredito.DTOs;

public class PrestatarioSearchDTO
{
    public int? Dni { get; set; }
    public string? Nombre { get; set; }
    public string? Apellido { get; set; }
    public string? Telefono { get; set; }
    public string? Domicilio { get; set; }
    public string? Correo { get; set; }
    public bool? EsActivo { get; set; }
}
