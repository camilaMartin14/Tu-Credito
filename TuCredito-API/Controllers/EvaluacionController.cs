using Microsoft.AspNetCore.Mvc;
using TuCredito.DTOs;
using TuCredito.Services.Interfaces;

namespace TuCredito.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EvaluacionController : ControllerBase
    {
        private readonly IEvaluacionCrediticiaService _evaluacionService;

        public EvaluacionController(IEvaluacionCrediticiaService evaluacionService)
        {
            _evaluacionService = evaluacionService;
        }

        [HttpPost]
        public async Task<ActionResult<EvaluacionCrediticiaResponseDTO>> Evaluar([FromBody] EvaluacionCrediticiaRequestDTO request)
        {
            try
            {
                var resultado = await _evaluacionService.EvaluarRiesgoAsync(request);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                // En un entorno real, loguearíamos el error
                return StatusCode(500, new { mensaje = "Ocurrió un error al procesar la evaluación", detalle = ex.Message });
            }
        }
    }
}
