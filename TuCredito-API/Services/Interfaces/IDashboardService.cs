using TuCredito.DTOs.Dashboard;

namespace TuCredito.Services.Interfaces;
    public interface IDashboardService
    {
        Task<DashboardKpisDTO> GetKpisAsync(DateTime? from = null, DateTime? to = null);
        Task<List<GraficoDatoDTO>> GetPrestamosPorEstadoAsync();
        Task<List<SerieTiempoDTO>> GetFlujoCobranzasAsync(DateTime? from = null, DateTime? to = null);
        Task<List<SerieTiempoDTO>> GetEvolucionColocacionAsync(DateTime? from = null, DateTime? to = null);
        Task<List<GraficoDatoDTO>> GetProyeccionFlujoCajaAsync();
        Task<List<GraficoDatoDTO>> GetComposicionRiesgoAsync();
        Task<List<MorosidadDetalleDTO>> GetMorosidadDetalladaAsync();
        Task<List<CuotaVencerDTO>> GetCuotasAVencerAsync();
        Task<List<GraficoDatoDTO>> GetRankingClientesDeudaAsync();
        Task<AnalistaTasaDTO> GetAnalisisTasasAsync();
        Task<List<SerieTiempoDTO>> GetEvolucionSaldoAsync();
    }
