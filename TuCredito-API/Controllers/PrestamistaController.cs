using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TuCredito.DTOs;
using TuCredito.Security;
using TuCredito.Services.Interfaces;

namespace TuCredito.Controllers
{
    [Route("api/lenders")]
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

        [HttpPost("register")]
        public async Task<ActionResult> Registrar([FromBody] PrestamistaRegisterDto dto)
        {
            try
            {
                var id = await _service.RegistrarPrestamistaAsync(dto);
                return CreatedAtAction(nameof(ObtenerActual), new { id }, null);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al registrar el prestamista.", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<Prestamista>> ObtenerActual()
        {
            try
            {
                var prestamistaIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (prestamistaIdClaim == null)
                    return Unauthorized(new { message = "Token inválido o expirado." });

                int prestamistaId = int.Parse(prestamistaIdClaim.Value);

                var prestamista = await _service.ObtenerPrestamistaPorIdAsync(prestamistaId);
                if (prestamista == null)
                    return NotFound(new { message = "Prestamista no encontrado." });

                return Ok(prestamista);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocurrió un error interno al obtener el prestamista.", error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] PrestamistaLoginDTO dto)
        {
            try
            {
                var prestamista = await _service.LoginAsync(dto.Usuario, dto.Contrasenia);
                if (prestamista == null)
                    return Unauthorized(new { message = "Credenciales incorrectas." });

                var token = _jwt.GenerateToken(prestamista.Id, prestamista.Usuario);

                return Ok(new
                {
                    token,
                    prestamista
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocurrió un error interno durante el inicio de sesión.", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("me")]
        public async Task<ActionResult> ActualizarPerfil([FromBody] PrestamistaUpdateDTO dto)
        {
            try
            {
                var prestamistaIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (prestamistaIdClaim == null)
                    return Unauthorized(new { message = "Token inválido o expirado." });

                int id = int.Parse(prestamistaIdClaim.Value);
                
                var resultado = await _service.UpdatePerfilAsync(id, dto);
                if (resultado) return Ok(new { message = "Perfil actualizado correctamente." });
                return BadRequest(new { message = "No se pudo actualizar el perfil." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar el perfil.", error = ex.Message });
            }
        }
    }
}
