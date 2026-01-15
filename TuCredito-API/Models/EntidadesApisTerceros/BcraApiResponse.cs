using System.Text.Json.Serialization;

namespace TuCredito.Models.EntidadesApisTerceros
{
    public class BcraApiResponse
    {
        public int Status { get; set; }
        public BcraResult? Results { get; set; }
    }

    public class BcraResult
    {
        public long Identificacion { get; set; }
        public string? Denominacion { get; set; }
        public List<BcraPeriodo>? Periodos { get; set; }
    }

    public class BcraPeriodo
    {
        public string? Periodo { get; set; }
        public List<BcraEntidad>? Entidades { get; set; }
    }

    public class BcraEntidad
    {
        public string? Entidad { get; set; }
        public int Situacion { get; set; }
        public decimal Monto { get; set; }
        public int DiasAtrasoPago { get; set; }
    }
}
