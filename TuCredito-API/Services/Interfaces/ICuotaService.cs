using TuCredito.Models;
using TuCredito.DTOs;
using TuCredito.Core;

namespace TuCredito.Services.Interfaces;

public interface ICuotaService
{
    Task<Result<Cuota>> GetById(int id);
    Task<Result<List<Cuota>>> GetByFiltro(int? estado, int? mesVto, string? prestatario);
    Task<Result<bool>> AddCuota(Cuota cuota); 
    Task<Result<bool>> UpdateCuota(Cuota cuota); 
    Task<Result<int>> ActualizarCuotasVencidas();
    Task<Result<List<Cuota>>> Getall(int idPrestamo);
}
