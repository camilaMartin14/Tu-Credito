using Azure.Core;
using Microsoft.AspNetCore.Mvc;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Services.Implementations;
using TuCredito.Services.Interfaces;

namespace TuCredito.Controllers
{
    [ApiController]
    [Route("api/calculadora")]
    public class CalculadoraController : ControllerBase
    {
        private readonly ICalculadoraService _calculadoraService;

        public CalculadoraController(ICalculadoraService calculadoraService)
        {
            _calculadoraService = calculadoraService;
        }


        [HttpPost("simular")]
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
                return BadRequest(ex.Message);
            }
        }


    }
}
