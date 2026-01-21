namespace TuCredito.DTOs;
    public class PrestatarioDTO // Datos completos del prestatario y garante
    {
        public int? Dni { get; set; }

        public string? Nombre { get; set; } = string.Empty;

        public string? Apellido { get; set; } = string.Empty;

        public string? Telefono { get; set; } = string.Empty;

        public string? Domicilio { get; set; } = string.Empty;

        public string? Correo { get; set; } = string.Empty;

        public bool? EsActivo { get; set; }

        public string? GaranteNombre { get; set; }
        public string? GaranteApellido { get; set; }
        public string? GaranteTelefono { get; set; }
        public string? GaranteDomicilio { get; set; }
        public string? GaranteCorreo { get; set; }

    }
