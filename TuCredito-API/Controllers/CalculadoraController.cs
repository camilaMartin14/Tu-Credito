using Azure.Core;
using Microsoft.AspNetCore.Mvc;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Services.Implementations;

namespace TuCredito.Controllers
{
    [ApiController]
    [Route("api/calculadora")]
    public class CalculadoraController : ControllerBase
    {
        private readonly CalculadoraService _calculadoraService;

        public CalculadoraController(CalculadoraService calculadoraService)
        {
            _calculadoraService = calculadoraService;
        }

        /// Calcula una simulación de préstamo sin persistir datos.
        [HttpPost("simular")]
        public ActionResult<SimulacionPrestamoOutputDTO> SimularPrestamo(
            [FromBody] SimulacionPrestamoEntryDTO entry)
        {
            try
            {
                var resultado = _calculadoraService.CalcularSimulacion(entry);
                return Ok(resultado);
            }
            catch (ArgumentException ex)
            {
                // Errores de validación → 400
                return BadRequest(ex.Message);
            }
        }

        /// Simula un pago anticipado sobre una simulación ya calculada.
        [HttpPost("simular-pago-anticipado")]
        public ActionResult<SimulacionPrestamoOutputDTO> SimularPagoAnticipado(
            [FromBody] SimulacionPagoAnticipadoDTO request)
        {
            try
            {
                _calculadoraService.SimularPagoAnticipado(
                    request.Simulacion,
                    request.MontoAnticipado);

                return Ok(request.Simulacion);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            
              //          "simulacion": {
              //                    "montoCuota": 12000,
              //                    "totalAPagar": 120000,
              //                    "detalleCuotas": [
              //                    { "numeroCuota": 1, "monto": 12000 },
              //                    { "numeroCuota": 2, "monto": 12000 }
              //                    ]
              //                        },
              //                    "montoAnticipado": 20000
            
        }

    }
}
