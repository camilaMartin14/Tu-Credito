using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Services.Implementations;
using TuCredito.Services.Interfaces;

namespace TuCredito.Controllers;
    [Route("api/payments")]
    [ApiController]
    public class PagoController : ControllerBase
    {
        private readonly IPagoService _service;
        private readonly IMapper _mapper;

        public PagoController(IPagoService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var pagos = await _service.GetAllPagos();
                return Ok(pagos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los pagos.", error = ex.Message });
            }
        }

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
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el pago.", error = ex.Message });
            }
        }

        [HttpGet("filter")]
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
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al filtrar pagos.", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> RegistrarPago([FromBody] PagoInputDTO nvoPago)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var pago = _mapper.Map<Pago>(nvoPago);
                await _service.NewPago(pago);
                return Ok(new { message = "Pago registrado correctamente" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al registrar el pago.", error = ex.Message });
            }
        }

        [HttpPost("advance")]
        public async Task<IActionResult> RegistrarPagoAnticipado([FromBody] PagoInputDTO nvoPago)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var pago = _mapper.Map<Pago>(nvoPago);
                await _service.RegistrarPagoAnticipadoAsync(pago);
                return Ok(new { message = "Pago anticipado registrado correctamente" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al registrar el pago anticipado.", error = ex.Message });
            }
        }

        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateEstado(int id, [FromBody] string estado) // eliminado x errores
        {
            if (string.IsNullOrWhiteSpace(estado)) 
                return BadRequest(new { message = "El estado es obligatorio" });

            try
            {
                await _service.UpdatePago(id, estado);
                return Ok(new { message = "Estado del pago actualizado" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar el estado del pago.", error = ex.Message });
            }
        }
    }
