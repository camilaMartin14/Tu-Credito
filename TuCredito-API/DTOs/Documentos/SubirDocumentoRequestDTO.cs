namespace TuCredito.DTOs.Documentos
{
    public class SubirDocumentoRequestDTO
    {
        public string EntidadTipo { get; set; } = null!;
        public int EntidadId { get; set; }
        public string TipoDocumento { get; set; } = null!;
        public IFormFile Archivo { get; set; } = null!;
        public int UsuarioId { get; set; }
    }
}
