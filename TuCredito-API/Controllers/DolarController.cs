using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TuCredito.Models.EntidadesApisTerceros;
using TuCredito.Services.Interfaces.Clients;

namespace TuCredito.Controllers
{
    [Route("api/dollar")]
    [ApiController]
    public class DolarController : ControllerBase
    {
        private readonly IDolarService _service;

        public DolarController(IDolarService service)
        {
            _service = service;
        }

        [HttpGet("official/today")] // Solo el oficial!! Consultar al cliente si quiere conocer otras cotizaciones como blue, etc
        public async Task<ActionResult<DolarOficialModel?>> GetDolarHoy()
        {
            try
            {
                return await _service.GetDolarOficialAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener la cotización del dólar.", error = ex.Message });
            }
        }
    }
}
