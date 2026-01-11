using Microsoft.AspNetCore.Mvc;
using TuCredito.Models;
using TuCredito.Services.Implementations;
using TuCredito.Services.Interfaces;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TuCredito.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CuotaController : ControllerBase
    {
        private readonly ICuotaService _service;
        public CuotaController(ICuotaService service)
        {
            _service = service;
        }
        // GET: api/<CuotaController>
               //getall?

        // GET api/<CuotaController>/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var cuota = await _service.GetById(id);
                return Ok(cuota);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("filtro")]
        public async Task<IActionResult> GetByFiltro([FromQuery] int? estado, [FromQuery] int? mesVto,[FromQuery] string? prestatario)
        {
            try
            {
                var cuotas = await _service.GetByFiltro(estado, mesVto, prestatario);
                return Ok(cuotas);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST api/<CuotaController>
        [HttpPost]
        public async Task<IActionResult> AddCuota([FromBody] Cuota nvaCuota)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var cuota = new Cuota
            {
                IdPrestamo = nvaCuota.IdPrestamo,
                Monto = nvaCuota.Monto,
                Interes = nvaCuota.Interes,
                FecVto = nvaCuota.FecVto,
                IdEstado = 1 // Pendiente
            };

            try
            {
                await _service.AddCuota(cuota);
                return Ok("Cuota creada correctamente");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }


        // PUT api/<CuotaController>/5
        [HttpPut]
        public async Task<IActionResult> UpdateCuota([FromBody] Cuota cuota)
        {
            try
            {
                await _service.UpdateCuota(cuota);
                return Ok("Cuota actualizada correctamente");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

       
    }
}
