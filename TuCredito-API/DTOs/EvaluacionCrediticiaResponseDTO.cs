namespace TuCredito.DTOs;
    public class EvaluacionCrediticiaResponseDTO
    {
        public  string Estado { get; set; } // APROBADO, RECHAZADO, REVISION
        public  string Motivo { get; set; }
        public decimal? MontoMaximoSugerido { get; set; }
        public  string SituacionBcra { get; set; }
        public  string DetalleRiesgo { get; set; }
    }
