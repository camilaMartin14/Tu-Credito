using System.Collections.Generic;

namespace TuCredito.Models.EntidadesApisTerceros
{
    public class DeudaResponse
    {
        public long Cuit { get; set; }
        public List<EntidadDeuda> Deudas { get; set; } = new List<EntidadDeuda>();
    }
}
