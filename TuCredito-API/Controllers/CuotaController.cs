using Microsoft.AspNetCore.Mvc;
using TuCredito.Models;
using TuCredito.Services.Implementations;
using TuCredito.DTOs;
using TuCredito.Services.Interfaces;

namespace TuCredito.Controllers
{
    [Route("api/installments")]
    [ApiController]
    public class CuotaController : ControllerBase
    {
        private readonly ICuotaService _service;
        public CuotaController(ICuotaService service)
        {
            _service = service;
        }
        
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var cuota = await _service.GetById(id);
                if (cuota == null) return NotFound(new { message = "La cuota no existe" });
                return Ok(cuota);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener la cuota.", error = ex.Message });
            }
        }

        [HttpGet("filter")]
        public async Task<IActionResult> GetByFiltro([FromQuery] int? estado, [FromQuery] int? mesVto,[FromQuery] string? prestatario)
        {
            try
            {
                var cuotas = await _service.GetByFiltro(estado, mesVto, prestatario);
                return Ok(cuotas);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al filtrar cuotas.", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddCuota([FromBody] CuotaInputDTO nvaCuota)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var cuota = new Cuota
                {
                    IdPrestamo = nvaCuota.IdPrestamo,
                    Monto = nvaCuota.Monto,
                    NroCuota = nvaCuota.NroCuota,
                    FecVto = nvaCuota.FecVto,
                    Interes = nvaCuota.Interes,
                    IdEstado = 1 // Pendiente
                };

                await _service.AddCuota(cuota);
                return Ok(new { message = "Cuota creada correctamente" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear la cuota.", error = ex.Message });
            }
        }
       
    }
}
