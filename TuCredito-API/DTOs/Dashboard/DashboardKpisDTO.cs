namespace TuCredito.DTOs.Dashboard;
    public class DashboardKpisDTO
    {
        public decimal TotalPrestadoHistorico { get; set; }
        public decimal CapitalPendiente { get; set; }
        public decimal TotalCobrado { get; set; }
        public decimal TotalInteresCobrado { get; set; }
        public decimal TotalEnMora { get; set; }
        public decimal PorcentajeMorosidad { get; set; }
        public decimal Rentabilidad { get; set; }
    }
