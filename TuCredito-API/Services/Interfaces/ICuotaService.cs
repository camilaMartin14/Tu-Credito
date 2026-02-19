using TuCredito.Models;
using TuCredito.DTOs;
using TuCredito.Core;

namespace TuCredito.Services.Interfaces;

public interface ICuotaService
{
    Task<Result<Cuota>> GetById(int id, CancellationToken cancellationToken = default);
    Task<Result<List<Cuota>>> GetByFiltro(int? estado, int? mesVto, string? prestatario, int? idPrestamo, CancellationToken cancellationToken = default);
    Task<Result<bool>> AddCuota(Cuota cuota, CancellationToken cancellationToken = default); 
    Task<Result<bool>> UpdateCuota(Cuota cuota, CancellationToken cancellationToken = default); 
    Task<Result<int>> ActualizarCuotasVencidas(CancellationToken cancellationToken = default);
    Task<Result<List<Cuota>>> Getall(int idPrestamo, CancellationToken cancellationToken = default);
}
