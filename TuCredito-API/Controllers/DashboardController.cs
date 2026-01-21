using Microsoft.AspNetCore.Mvc;
using TuCredito.Services.Interfaces;
using TuCredito.DTOs;
using TuCredito.DTOs.Dashboard;

namespace TuCredito.Controllers;
    [Route("api/dashboard")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("kpis")]
        public async Task<ActionResult<DashboardKpisDTO>> GetKpis([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            try
            {
                var kpis = await _dashboardService.GetKpisAsync(from, to);
                return Ok(kpis);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener KPIs.", error = ex.Message });
            }
        }

        [HttpGet("cash-flow-projection")]
        public async Task<ActionResult<List<GraficoDatoDTO>>> GetProyeccionFlujoCaja()
        {
            try
            {
                var result = await _dashboardService.GetProyeccionFlujoCajaAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener proyección de flujo de caja.", error = ex.Message });
            }
        }

        [HttpGet("loans-trend")]
        public async Task<ActionResult<List<SerieTiempoDTO>>> GetEvolucionColocacion([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            try
            {
                var result = await _dashboardService.GetEvolucionColocacionAsync(from, to);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener evolución de colocación.", error = ex.Message });
            }
        }

        [HttpGet("risk-composition")]
        public async Task<ActionResult<List<GraficoDatoDTO>>> GetComposicionRiesgo()
        {
            try
            {
                var result = await _dashboardService.GetComposicionRiesgoAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener composición de riesgo.", error = ex.Message });
            }
        }

        [HttpGet("loans-by-status")]
        public async Task<ActionResult<List<GraficoDatoDTO>>> GetPrestamosPorEstado()
        {
            try
            {
                var result = await _dashboardService.GetPrestamosPorEstadoAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener préstamos por estado.", error = ex.Message });
            }
        }

        [HttpGet("monthly-collections")]
        public async Task<ActionResult<List<SerieTiempoDTO>>> GetFlujoCobranzas([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            try
            {
                var result = await _dashboardService.GetFlujoCobranzasAsync(from, to);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener flujo de cobranzas.", error = ex.Message });
            }
        }

        [HttpGet("delinquency")]
        public async Task<ActionResult<List<MorosidadDetalleDTO>>> GetMorosidadDetallada()
        {
            try
            {
                var result = await _dashboardService.GetMorosidadDetalladaAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener detalle de morosidad.", error = ex.Message });
            }
        }

        [HttpGet("upcoming-installments")]
        public async Task<ActionResult<List<CuotaVencerDTO>>> GetCuotasAVencer()
        {
            try
            {
                var result = await _dashboardService.GetCuotasAVencerAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener cuotas a vencer.", error = ex.Message });
            }
        }

        [HttpGet("customer-ranking")]
        public async Task<ActionResult<List<GraficoDatoDTO>>> GetRankingClientes()
        {
            try
            {
                var result = await _dashboardService.GetRankingClientesDeudaAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener ranking de clientes.", error = ex.Message });
            }
        }

        [HttpGet("rate-analysis")]
        public async Task<ActionResult<AnalistaTasaDTO>> GetAnalisisTasas()
        {
            try
            {
                var result = await _dashboardService.GetAnalisisTasasAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener análisis de tasas.", error = ex.Message });
            }
        }


        [HttpGet("balance-evolution")]
        public async Task<ActionResult<List<SerieTiempoDTO>>> GetEvolucionSaldo()
        {
            try
            {
                var result = await _dashboardService.GetEvolucionSaldoAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener evolución de saldo.", error = ex.Message });
            }
        }
    }
