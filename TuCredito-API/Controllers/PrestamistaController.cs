using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Security;
using TuCredito.Services.Interfaces;

namespace TuCredito.Controllers;
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
        public async Task<ActionResult> Registrar([FromBody] PrestamistaRegisterDto dto, CancellationToken cancellationToken = default)
        {
            try
            {
                var id = await _service.RegistrarPrestamistaAsync(dto, cancellationToken);
                return CreatedAtAction(nameof(ObtenerActual), new { id }, null);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al registrar el prestamista.", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<PrestamistaResponseDTO>> ObtenerActual(CancellationToken cancellationToken = default)
        {
            try
            {
                var prestamistaIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (prestamistaIdClaim == null)
                    return Unauthorized(new { message = "Token inválido o expirado." });

                int prestamistaId = int.Parse(prestamistaIdClaim.Value);

                var prestamista = await _service.ObtenerPrestamistaPorIdAsync(prestamistaId, cancellationToken);
                if (prestamista == null)
                    return NotFound(new { message = "Prestamista no encontrado." });

                var response = new PrestamistaResponseDTO
                {
                    Id = prestamista.Id,
                    Nombre = prestamista.Nombre,
                    Apellido = prestamista.Apellido,
                    Usuario = prestamista.Usuario,
                    Correo = prestamista.Correo,
                    EsActivo = prestamista.EsActivo
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocurrió un error interno al obtener el prestamista.", error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] PrestamistaLoginDTO dto, CancellationToken cancellationToken = default)
        {
            try
            {
                var prestamista = await _service.LoginAsync(dto.Usuario, dto.Contrasenia, cancellationToken);
                if (prestamista == null)
                    return Unauthorized(new { message = "Credenciales incorrectas." });

                var token = _jwt.GenerateToken(prestamista.Id, prestamista.Usuario);

                var response = new PrestamistaResponseDTO
                {
                    Id = prestamista.Id,
                    Nombre = prestamista.Nombre,
                    Apellido = prestamista.Apellido,
                    Usuario = prestamista.Usuario,
                    Correo = prestamista.Correo,
                    EsActivo = prestamista.EsActivo
                };

                return Ok(new
                {
                    token,
                    prestamista = response
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocurrió un error interno durante el inicio de sesión.", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("me")]
        public async Task<ActionResult> ActualizarPerfil([FromBody] PrestamistaUpdateDTO dto, CancellationToken cancellationToken = default)
        {
            try
            {
                var prestamistaIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (prestamistaIdClaim == null)
                    return Unauthorized(new { message = "Token inválido o expirado." });

                int id = int.Parse(prestamistaIdClaim.Value);
                
                var resultado = await _service.UpdatePerfilAsync(id, dto, cancellationToken);
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
