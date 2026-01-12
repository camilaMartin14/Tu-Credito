using System;

namespace TuCredito.Models.Documentos
{
    public class Documento
    {
        public int IdDocumento { get; private set; }
        public string EntidadTipo { get; private set; }
        public int EntidadId { get; private set; }
        public string TipoDocumento { get; private set; }
        public string NombreOriginal { get; private set; }
        public string RutaStorage { get; private set; }
        public string ContentType { get; private set; }
        public DateTime FechaSubida { get; private set; }
        public int SubidoPor { get; private set; }
        public bool Activo { get; private set; }

        public Documento(
            string entidadTipo,
            int entidadId,
            string tipoDocumento,
            string nombreOriginal,
            string rutaStorage,
            string contentType,
            int subidoPor)
        {
            EntidadTipo = entidadTipo;
            EntidadId = entidadId;
            TipoDocumento = tipoDocumento;
            NombreOriginal = nombreOriginal;
            RutaStorage = rutaStorage;
            ContentType = contentType;
            SubidoPor = subidoPor;
            FechaSubida = DateTime.UtcNow;
            Activo = true;
        }

        // Constructor vacio para EF Core
        private Documento() { }

        public void Desactivar()
        {
            Activo = false;
        }
    }
}
