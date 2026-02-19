using TuCredito.DTOs.Dashboard;

namespace TuCredito.Services.Interfaces;
    public interface IDashboardService
    {
        Task<DashboardKpisDTO> GetKpisAsync(DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
        Task<List<GraficoDatoDTO>> GetPrestamosPorEstadoAsync(CancellationToken cancellationToken = default);
        Task<List<SerieTiempoDTO>> GetFlujoCobranzasAsync(DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
        Task<List<SerieTiempoDTO>> GetEvolucionColocacionAsync(DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
        Task<List<GraficoDatoDTO>> GetProyeccionFlujoCajaAsync(CancellationToken cancellationToken = default);
        Task<List<GraficoDatoDTO>> GetComposicionRiesgoAsync(CancellationToken cancellationToken = default);
        Task<List<MorosidadDetalleDTO>> GetMorosidadDetalladaAsync(CancellationToken cancellationToken = default);
        Task<List<CuotaVencerDTO>> GetCuotasAVencerAsync(CancellationToken cancellationToken = default);
        Task<List<TransactionDTO>> GetRecentTransactionsAsync(CancellationToken cancellationToken = default);
        Task<List<GraficoDatoDTO>> GetRankingClientesDeudaAsync(CancellationToken cancellationToken = default);
        Task<AnalistaTasaDTO> GetAnalisisTasasAsync(CancellationToken cancellationToken = default);
        Task<List<SerieTiempoDTO>> GetEvolucionSaldoAsync(CancellationToken cancellationToken = default);
    }
