using Microsoft.AspNetCore.Mvc;
using TuCredito.Models;
using TuCredito.DTOs;
using TuCredito.Services.Interfaces;

namespace TuCredito.Controllers;

[Route("api/installments")]
[ApiController]
public class CuotaController : ControllerBase
{
    private readonly ICuotaService _service;
    public CuotaController(ICuotaService service)
    {
        _service = service;
    }
    
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetById(id);
        if (result.IsFailure) return BadRequest(new { message = result.Error });
        return Ok(result.Value);
    }

    [HttpGet("filter")]
    public async Task<IActionResult> GetByFiltro([FromQuery] int? estado, [FromQuery] int? mesVto,[FromQuery] string? prestatario)
    {
        var result = await _service.GetByFiltro(estado, mesVto, prestatario);
        if (result.IsFailure) return BadRequest(new { message = result.Error });
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> AddCuota([FromBody] CuotaInputDTO nvaCuota)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var cuota = new Cuota
        {
            IdPrestamo = nvaCuota.IdPrestamo,
            Monto = nvaCuota.Monto,
            NroCuota = nvaCuota.NroCuota,
            FecVto = nvaCuota.FecVto,
            Interes = nvaCuota.Interes,
            IdEstado = 1 // Pendiente
        };

        var result = await _service.AddCuota(cuota);
        if (result.IsFailure) return BadRequest(new { message = result.Error });
        
        return Ok(new { message = "Cuota creada correctamente" });
    }
   
}
