using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TuCredito.Services.Implementations.Clients;

namespace TuCredito.Controllers;
    [Route("api/debts")]
    [ApiController]
    public class DeudasController : ControllerBase
    {
        private readonly BcraDeudoresService _deudaService;

        public DeudasController(BcraDeudoresService deudaService)
        {
            _deudaService = deudaService;
        }

        [HttpGet("{cuit}")]
        public async Task<IActionResult> GetDeudas(string cuit)
        {
            if (!long.TryParse(cuit, out var cuitNumerico))
            {
                return BadRequest(new { message = "El CUIT debe ser un valor numérico válido." });
            }

            try
            {
                var resultado = await _deudaService.GetDeudasByCuitAsync(cuitNumerico);

                if (resultado == null)
                    return NotFound(new { message = "No se encontraron deudas para el CUIT informado." });

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno al consultar deudas", error = ex.Message });
            }
        }
    }