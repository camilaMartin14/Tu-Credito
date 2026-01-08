using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TuCredito.DTOs;


using TuCredito.Models;
using TuCredito.Services.Implementations;
using TuCredito.Services.Interfaces;

namespace TuCredito.Controllers
{
    [Authorize] //Se agrega auth para que solo los usuarios autenticados puedan crear o acceder a los prestamos
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

        //AGREGO PAGINACIÓN CADA 10 REGISTROS
        [HttpGet]
        [HttpGet]
        public async Task<ActionResult<List<PrestamoDTO>>> GetAll(int page = 1, int pageSize = 10)
        {
            var lista = await _service.GetAll(page, pageSize);
            return Ok(lista);
        }


        // GET api/<PrestamoController>/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PrestamoDTO>> GetById(int id)
        {
            var prestamo = await _service.GetPrestamoById(id);
            return prestamo;
        }

        [HttpGet("Get-con-filtro")] //Cmabio de nombre, endpoints no pueden tener espacios pues URL
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

        //// DELETE api/<PrestamoController>/5
        ///Se comenta para que no queden endpoints sin uso
        ///
        //[HttpDelete("{id}")]
        //public void Delete(int id)
        //{
        //}
    }
}
