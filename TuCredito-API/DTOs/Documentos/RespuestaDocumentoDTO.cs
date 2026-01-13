namespace TuCredito.DTOs.Documentos
{
    public class RespuestaDocumentoDTO
    {
        public int IdDocumento { get; set; }
        public string TipoDocumento { get; set; } = null!;
        public string NombreOriginal { get; set; } = null!;
        public DateTime FechaSubida { get; set; }
    }
}
    