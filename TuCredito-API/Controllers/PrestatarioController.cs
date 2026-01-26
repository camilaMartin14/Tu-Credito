using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Services.Interfaces;

namespace TuCredito.Controllers;
    [Route("api/borrowers")]
    [ApiController]
    public class PrestatarioController : ControllerBase
    {
        private readonly IPrestatarioService _service;
        private readonly IMapper _mapper;

        public PrestatarioController(IPrestatarioService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] Prestatario prestatario)
        {
            try
            {
                var dni = await _service.CrearAsync(prestatario);
                
                var dto = _mapper.Map<PrestatarioDTO>(prestatario);
                
                return CreatedAtAction(nameof(ObtenerPorDni), new { dni }, dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear el prestatario.", error = ex.Message });
            }
        }

        [HttpGet("{dni:int}")]
        public async Task<IActionResult> ObtenerPorDni(int dni)
        {
            try
            {
                var prestatario = await _service.ObtenerPorDniAsync(dni);

                if (prestatario == null)
                    return NotFound(new { message = "Prestatario no encontrado." });

                var dto = _mapper.Map<PrestatarioDTO>(prestatario);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el prestatario.", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerConFiltros([FromQuery] PrestatarioDTO filtro)
        {
            try
            {
                var lista = await _service.ObtenerConFiltrosAsync(filtro);
                var dtos = _mapper.Map<List<PrestatarioDTO>>(lista);
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los prestatarios.", error = ex.Message });
            }
        }

        [HttpPut("{dni:int}")]
        public async Task<IActionResult> Actualizar(int dni, [FromBody] Prestatario prestatario)
        {
            try
            {
                if (dni != prestatario.Dni)
                    return BadRequest(new { message = "El DNI de la URL no coincide con el del cuerpo." });

                var actualizado = await _service.ActualizarAsync(prestatario);

                if (!actualizado)
                    return NotFound(new { message = "No se pudo actualizar. Prestatario no encontrado." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar el prestatario.", error = ex.Message });
            }
        }

        [HttpPatch("{dni:int}/status")]
        public async Task<IActionResult> CambiarEstado(int dni, [FromQuery] bool activo)
        {
            try
            {
                var ok = await _service.CambiarEstadoAsync(dni, activo);

                if (!ok)
                    return NotFound(new { message = "No se pudo cambiar el estado. Prestatario no encontrado." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al cambiar el estado del prestatario.", error = ex.Message });
            }
        }
    }