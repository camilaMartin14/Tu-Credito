using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TuCredito.DTOs;


using TuCredito.Models;
using TuCredito.Services.Implementations;
using TuCredito.Services.Interfaces;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TuCredito.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrestamoController : ControllerBase
    {
        private readonly IPrestamoService _service;
        public PrestamoController(IPrestamoService service)
        {
            _service = service;
        }
        // GET: api/<PrestamoController>
        [HttpGet]
        public async Task<ActionResult<List<PrestamoDTO>>> GetAll()
        {
            
            var lista = await _service.GetAllPrestamo();
            return lista;
        }

        // GET api/<PrestamoController>/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PrestamoDTO>> GetById(int id)
        {
            var prestamo = await _service.GetPrestamoById(id);
            return prestamo;
        }

        [HttpGet("Get con filtro")]
        public async Task<ActionResult<List<PrestamoDTO>>> GetConFiltro(string? nombre, int? estado, int? mesVto, int? anio)
        {

            var lista = await _service.GetPrestamoConFiltro(nombre, estado, mesVto, anio);
            return lista;
        }

        // POST api/<PrestamoController>
        [HttpPost]
        public async Task<IActionResult> PostPrestamo([FromBody] PrestamoDTO prestamo)
        {
            var resultado = await _service.PostPrestamo(prestamo); 
            if (!resultado) return BadRequest("No se pudo registrar el préstamo. Verifique los datos ingresados."); 
            return Ok("Préstamo registrado correctamente.");
        }

        // PUT api/<PrestamoController>/5
        [HttpPut("{id}")]
        public async Task<IActionResult> CambioDeEstado(int id, [FromBody] string value)
        {
            var resultado = await _service.SoftDelete(id); 
            if (resultado) return Ok("Préstamo finalizado correctamente."); 
            return BadRequest("No se pudo finalizar el préstamo.");
        }

        // DELETE api/<PrestamoController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
