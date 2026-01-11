using TuCredito.DTOs.Dashboard;

namespace TuCredito.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardKpisDTO> GetKpisAsync();
        Task<List<GraficoDatoDTO>> GetPrestamosPorEstadoAsync();
        Task<List<SerieTiempoDTO>> GetFlujoCobranzasAsync();
        Task<List<MorosidadDetalleDTO>> GetMorosidadDetalladaAsync();
        Task<List<CuotaVencerDTO>> GetCuotasAVencerAsync();
        Task<List<GraficoDatoDTO>> GetRankingClientesDeudaAsync();
        Task<AnalistaTasaDTO> GetAnalisisTasasAsync();
        Task<List<SerieTiempoDTO>> GetEvolucionSaldoAsync();
    }
}
