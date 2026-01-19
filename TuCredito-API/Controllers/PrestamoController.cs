using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TuCredito.DTOs;


using TuCredito.Models;
using TuCredito.Services.Implementations;
using TuCredito.Services.Interfaces;

namespace TuCredito.Controllers
{
    [Authorize] 
    [Route("api/loans")]
    [ApiController]
    public class PrestamoController : ControllerBase
    {
        private readonly IPrestamoService _service;
        public PrestamoController(IPrestamoService service)
        {
            _service = service;
        }
        [HttpGet]
        public async Task<ActionResult<List<PrestamoDTO>>> ObtenerTodos()
        {
            try
            {
                var lista = await _service.GetAll();
                return Ok(lista);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los préstamos.", error = ex.Message });
            }

        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PrestamoDTO>> ObtenerPorId(int id)
        {
            try
            {
                var prestamo = await _service.GetPrestamoById(id);
                if (prestamo == null)
                    return NotFound(new { message = "Préstamo no encontrado." });
                return Ok(prestamo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el préstamo.", error = ex.Message });
            }
        }

        [HttpGet("filter")] 
        public async Task<ActionResult<List<PrestamoDTO>>> ObtenerConFiltro(string? nombre, int? estado, int? mesVto, int? anio)
        {
            try
            {
                var lista = await _service.GetPrestamoConFiltro(nombre, estado, mesVto, anio);
                return Ok(lista);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al filtrar préstamos.", error = ex.Message });
            }
        }

        [HttpGet("{id}/summary")]
        public async Task<ActionResult<ResumenPrestamoDTO>> ObtenerResumen(int id)
        {
            try
            {
                var resumen = await _service.GetResumenPrestamo(id);
                if (resumen == null)
                    return NotFound(new { message = "Resumen no encontrado." });
                return Ok(resumen);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el resumen del préstamo.", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> Crear([FromBody] PrestamoDTO prestamo)
        {
            try
            {
                var resultado = await _service.PostPrestamo(prestamo);
                if (!resultado) return BadRequest(new { message = "No se pudo registrar el préstamo. Verifique los datos ingresados." });
                
                return StatusCode(201, new { message = "Préstamo registrado correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al registrar el préstamo.", error = ex.Message });
            }
        }

        [HttpPut("{id}/archive")]
        public async Task<IActionResult> Archivar(int id)
        {
            try
            {
                var resultado = await _service.SoftDelete(id);
                if (resultado) return Ok(new { message = "Préstamo finalizado correctamente." });
                return BadRequest(new { message = "No se pudo finalizar el préstamo." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al finalizar el préstamo.", error = ex.Message });
            }
        }
    }
}
