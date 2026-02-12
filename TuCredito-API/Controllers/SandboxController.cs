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
        [AllowAnonymous] 
        public async Task<IActionResult> ResetDemoData()
        {
            var demoUser = await _context.Prestamistas.FirstOrDefaultAsync(p => p.Usuario == "demo");
            
            if (demoUser != null)
            {
                var prestamos = await _context.Prestamos
                    .Where(p => p.IdPrestamista == demoUser.Id)
                    .ToListAsync();

                if (prestamos.Any())
                {
                    _context.Prestamos.RemoveRange(prestamos);
                    await _context.SaveChangesAsync();
                }
                
            }

            DbInitializer.Initialize(_context);

            return Ok(new { message = "Datos del entorno Sandbox restaurados correctamente." });
        }
    }
}
