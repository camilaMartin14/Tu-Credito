using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Services.Interfaces;

namespace TuCredito.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrestatarioController : ControllerBase
    {
        private readonly IPrestatarioService _service;

        public PrestatarioController(IPrestatarioService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] Prestatario prestatario)
        {
            var dni = await _service.CrearAsync(prestatario);
            return CreatedAtAction(nameof(ObtenerPorDni), new { dni }, prestatario);
        }

        [HttpGet("{dni:int}")]
        public async Task<IActionResult> ObtenerPorDni(int dni)
        {
            var prestatario = await _service.ObtenerPorDniAsync(dni);

            if (prestatario == null)
                return NotFound();

            return Ok(prestatario);
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerConFiltros([FromQuery] PrestatarioDTO filtro)
        {
            var lista = await _service.ObtenerConFiltrosAsync(filtro);
            return Ok(lista);
        }

        [HttpPut("{dni:int}")]
        public async Task<IActionResult> Actualizar(int dni, [FromBody] Prestatario prestatario)
        {
            if (dni != prestatario.Dni)
                return BadRequest("El dni de la URL no coincdnie con el del body.");

            var actualizado = await _service.ActualizarAsync(prestatario);

            if (!actualizado)
                return NotFound();

            return NoContent();
        }

        [HttpPatch("{dni:int}/estado")]
        public async Task<IActionResult> CambiarEstado(int dni, [FromQuery] bool activo)
        {
            var ok = await _service.CambiarEstadoAsync(dni, activo);

            if (!ok)
                return NotFound();

            return NoContent();
        }
    }
}
