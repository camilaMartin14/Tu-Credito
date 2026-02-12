using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TuCredito.Data;
using TuCredito.Models;

namespace TuCredito.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SandboxController : ControllerBase
    {
        private readonly TuCreditoContext _context;

        public SandboxController(TuCreditoContext context)
        {
            _context = context;
        }

        [HttpPost("reset")]
        [AllowAnonymous] // Permitir reset sin login para facilitar el testing inicial, o cambiar a [Authorize] si se prefiere seguridad
        public async Task<IActionResult> ResetDemoData()
        {
            // 1. Identificar al usuario demo
            var demoUser = await _context.Prestamistas.FirstOrDefaultAsync(p => p.Usuario == "demo");
            
            if (demoUser != null)
            {
                // 2. Eliminar datos relacionados al usuario demo para forzar la regeneración
                // Eliminar préstamos (y en cascada cuotas/pagos si la FK está configurada, sino manualmente)
                var prestamos = await _context.Prestamos
                    .Where(p => p.IdPrestamista == demoUser.Id)
                    .ToListAsync();

                if (prestamos.Any())
                {
                    _context.Prestamos.RemoveRange(prestamos);
                    await _context.SaveChangesAsync();
                }
                
                // Nota: No eliminamos al usuario demo en sí para mantener su ID y password,
                // pero si quisiéramos un reset total, podríamos hacerlo.
                // El DbInitializer actual es "aditivo", si faltan préstamos para el usuario demo, los crea.
                // Al borrar los préstamos arriba, el DbInitializer los volverá a crear.
            }

            // 3. Ejecutar el Initializer para regenerar los datos
            DbInitializer.Initialize(_context);

            return Ok(new { message = "Datos del entorno Sandbox restaurados correctamente." });
        }
    }
}
