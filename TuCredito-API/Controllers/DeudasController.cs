using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TuCredito.Services.Implementations.Clients;

namespace TuCredito.Controllers
{
    [Route("api/[controller]")]
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
                return BadRequest("El CUIT debe ser un valor numérico válido.");
            }

            try
            {
                var resultado = await _deudaService.GetDeudasByCuitAsync(cuitNumerico);

                if (resultado == null)
                    return NotFound("No se encontraron deudas para el CUIT informado.");

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno al consultar deudas: {ex.Message}");
            }
        }
    }
}
