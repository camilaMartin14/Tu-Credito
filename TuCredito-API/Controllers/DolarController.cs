using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TuCredito.Models.EntidadesApisTerceros;
using TuCredito.Services.Interfaces.Clients;

namespace TuCredito.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DolarController : ControllerBase
    {
        private readonly IDolarService _service;

        public DolarController(IDolarService service)
        {
            _service = service;
        }

        [HttpGet("dolar/hoy")] // Solo el oficial!! Consultar al cliente si quiere conocer otras cotizaciones como blue, etc
        public async Task<ActionResult<DolarOficialModel?>> GetDolarHoy()
        {
            return await _service.GetDolarOficialAsync();
        }
    }
}
