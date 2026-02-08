using Azure.Core;
using Microsoft.AspNetCore.Mvc;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Services.Implementations;
using TuCredito.Services.Interfaces;

namespace TuCredito.Controllers;
    [ApiController]
    [Route("api/calculator")]
    public class CalculadoraController : ControllerBase
    {
        private readonly ICalculadoraService _calculadoraService;

        public CalculadoraController(ICalculadoraService calculadoraService)
        {
            _calculadoraService = calculadoraService;
        }


        [HttpPost("simulate")]
        public ActionResult<SimulacionPrestamoOutputDTO> SimularPrestamo(
            [FromBody] SimulacionPrestamoEntryDTO entry)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var resultado = _calculadoraService.CalcularSimulacion(entry);
                return Ok(resultado);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al simular el préstamo.", error = ex.Message });
            }
        }
    }