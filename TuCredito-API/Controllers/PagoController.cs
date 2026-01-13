using Microsoft.AspNetCore.Mvc;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Services.Implementations;
using TuCredito.Services.Interfaces;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TuCredito.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PagoController : ControllerBase
    {
        private readonly IPagoService _service;
        public PagoController(IPagoService service)
        {
            _service = service;
        }
        // GET: api/<PagosController>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var pagos = await _service.GetAllPagos();
            return Ok(pagos);
        }

        // GET api/<PagosController>/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var pago = await _service.GetPagoById(id);
                if (pago == null) return NotFound(new { message = "El pago indicado no existe" });
                return Ok(pago);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("filtro")]
        public async Task<IActionResult> GetConFiltro( [FromQuery] string? nombre, [FromQuery] int? mes)
        {
            try
            {
                var pagos = await _service.GetPagoConFiltro(nombre, mes);
                if (pagos == null) return NotFound(new { message = "No se encontraron pagos con los filtros indicados" });
                if ((!string.IsNullOrWhiteSpace(nombre) || mes.HasValue) && !pagos.Any())
                {
                    return NotFound(new{message = "No se encontraron pagos con los filtros ingresados"});
                }
                return Ok(pagos);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST api/<PagosController>
        [HttpPost]
        public async Task<IActionResult> RegistrarPago([FromBody] PagoInputDTO nvoPago)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var pago = new Pago
            {
                IdCuota = nvoPago.IdCuota,
                Monto = nvoPago.Monto,
                FecPago = DateTime.Now,
                IdMedioPago = nvoPago.IdMedioPago
                
            };

            try
            {
                await _service.NewPago(pago);
                return Ok("Pago registrado correctamente");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpPost("anticipado")]
        public async Task<IActionResult> RegistrarPagoAnticipado([FromBody] PagoInputDTO nvoPago)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var pago = new Pago
            {
                IdCuota = nvoPago.IdCuota,
                Monto = nvoPago.Monto,
                FecPago = DateTime.Now
            };

            try
            {
                await _service.RegistrarPagoAnticipadoAsync(pago);
                return Ok("Pago anticipado registrado correctamente");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
           
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{id:int}/estado")]
        public async Task<IActionResult> UpdateEstado(int id, [FromBody] string estado) // eliminado x errores
        {
            if (string.IsNullOrWhiteSpace(estado)) 
                return BadRequest("El estado es obligatorio");

            try
            {
                await _service.UpdatePago(id, estado);
                return Ok("Estado del pago actualizado");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
