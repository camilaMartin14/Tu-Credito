using Microsoft.AspNetCore.Mvc;
using TuCredito.Services.Interfaces;
using TuCredito.DTOs;
using TuCredito.DTOs.Dashboard;

namespace TuCredito.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("kpis")]
        public async Task<ActionResult<DashboardKpisDTO>> GetKpis()
        {
            var kpis = await _dashboardService.GetKpisAsync();
            return Ok(kpis);
        }

        [HttpGet("prestamos-estado")]
        public async Task<ActionResult<List<GraficoDatoDTO>>> GetPrestamosPorEstado()
        {
            var result = await _dashboardService.GetPrestamosPorEstadoAsync();
            return Ok(result);
        }

        [HttpGet("cobranzas-mensuales")]
        public async Task<ActionResult<List<SerieTiempoDTO>>> GetFlujoCobranzas()
        {
            var result = await _dashboardService.GetFlujoCobranzasAsync();
            return Ok(result);
        }

        [HttpGet("morosidad")]
        public async Task<ActionResult<List<MorosidadDetalleDTO>>> GetMorosidadDetallada()
        {
            var result = await _dashboardService.GetMorosidadDetalladaAsync();
            return Ok(result);
        }

        [HttpGet("cuotas-vencer")]
        public async Task<ActionResult<List<CuotaVencerDTO>>> GetCuotasAVencer()
        {
            var result = await _dashboardService.GetCuotasAVencerAsync();
            return Ok(result);
        }

        [HttpGet("ranking-clientes")]
        public async Task<ActionResult<List<GraficoDatoDTO>>> GetRankingClientes()
        {
            var result = await _dashboardService.GetRankingClientesDeudaAsync();
            return Ok(result);
        }

        [HttpGet("analisis-tasas")]
        public async Task<ActionResult<AnalistaTasaDTO>> GetAnalisisTasas()
        {
            var result = await _dashboardService.GetAnalisisTasasAsync();
            return Ok(result);
        }


        [HttpGet("evolucion-saldo")]
        public async Task<ActionResult<List<SerieTiempoDTO>>> GetEvolucionSaldo()
        {
            var result = await _dashboardService.GetEvolucionSaldoAsync();
            return Ok(result);
        }
    }
}
