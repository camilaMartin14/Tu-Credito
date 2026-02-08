namespace TuCredito.DTOs;

public class PrestamistaResponseDTO
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Usuario { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public bool EsActivo { get; set; }
}
