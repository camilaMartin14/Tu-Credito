namespace TuCredito.DTOs.Dashboard;
    public class AnalistaTasaDTO
    {
        public decimal TasaPromedioGlobal { get; set; }
        public List<GraficoDatoDTO> DistribucionPorRango { get; set; } = new List<GraficoDatoDTO>();
    }