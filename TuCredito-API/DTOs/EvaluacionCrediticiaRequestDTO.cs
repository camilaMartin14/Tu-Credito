namespace TuCredito.DTOs
{
    public class EvaluacionCrediticiaRequestDTO
    {
        public long Cuit { get; set; }
        public decimal MontoSolicitado { get; set; }
        public decimal CuotaEstimada { get; set; }
        public decimal? IngresoMensual { get; set; }
    }
}
