#nullable disable
using System;
using System.Collections.Generic;

namespace TuCredito.Models;

public partial class Documento
{
    public int IdDocumento { get; set; }

    public string EntidadTipo { get; set; }

    public int EntidadId { get; set; }

    public string TipoDocumento { get; set; }

    public string NombreOriginal { get; set; }

    public string RutaStorage { get; set; }

    public string ContentType { get; set; }

    public DateTime FechaSubida { get; set; } = DateTime.Now;

    public int SubidoPor { get; set; }

    public bool Activo { get; set; }
}