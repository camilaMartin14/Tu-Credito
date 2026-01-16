using TuCredito.Models.Enums;

namespace TuCredito.Models.EntidadesApisTerceros
{
    public class EntidadDeuda
    {
        public string? Entidad { get; set; }
        public SituacionCrediticia Situacion { get; set; }
        public decimal Monto { get; set; }
        public int DiasAtraso { get; set; }
    }
}
