using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TuCredito.DTOs;
using TuCredito.Security;
using TuCredito.Services.Interfaces;

namespace TuCredito.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrestamistaController : ControllerBase
    {
        private readonly IPrestamistaService _service;
        private readonly JwtTokenGenerator _jwt;
        public PrestamistaController(IPrestamistaService service, JwtTokenGenerator jwt)
        {
            _service = service;
            _jwt = jwt;
        }

        [HttpPost("registro")]
        public async Task<IActionResult> Registrar([FromBody] PrestamistaRegisterDto dto)
        {
            try
            {
                var id = await _service.RegistrarPrestamistaAsync(dto);
                return CreatedAtAction(nameof(ObtenerActual), new { id }, null);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> ObtenerActual()
        {
            var prestamistaIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (prestamistaIdClaim == null)
                return Unauthorized();

            int prestamistaId = int.Parse(prestamistaIdClaim.Value);

            var prestamista= await _service.ObtenerPrestamistaPorIdAsync(prestamistaId);
            if (prestamista== null)
                return NotFound();

            return Ok(prestamista);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] PrestamistaLoginDTO dto)
        {
            var prestamista= await _service.LoginAsync(dto.Usuario, dto.Contrasenia);
            if (prestamista== null)
                return Unauthorized();

            var token = _jwt.GenerateToken(prestamista.Id, prestamista.Usuario);

            return Ok(new
            {
                token,
                prestamista
            });
        }
    }
}
