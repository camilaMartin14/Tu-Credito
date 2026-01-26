using TuCredito.Models;
using TuCredito.Services.Interfaces;
using TuCredito.Repositories.Interfaces;
using TuCredito.Core;
using Microsoft.EntityFrameworkCore;

namespace TuCredito.Services.Implementations;

public class CuotaService : ICuotaService
{
    private readonly IPrestamoRepository _prestamo;
    private readonly ICuotaRepository _cuota;
    private readonly TuCreditoContext _context;

    public CuotaService(IPrestamoRepository prestamo, ICuotaRepository cuota, TuCreditoContext context)
    {
        _prestamo = prestamo;
        _cuota = cuota;
        _context = context;
    }

    public async Task<Result<bool>> AddCuota(Cuota cuota)
    {
        try
        {
            if (cuota.IdPrestamo <= 0) return Result<bool>.Failure("La cuota debe estar asociada a un préstamo");

            var prestamo = await _prestamo.GetPrestamoById(cuota.IdPrestamo);
            if (prestamo == null) return Result<bool>.Failure("El préstamo no existe");
            
            if (prestamo.IdEstado == 2) return Result<bool>.Failure("No se pueden agregar cuotas a un préstamo inactivo"); // finalizado
            if (prestamo.IdEstado == 3) return Result<bool>.Failure("No se pueden agregar cuotas a un préstamo inactivo"); // eliminado
            if (cuota.IdEstado != 1) return Result<bool>.Failure("Solo se pueden dar de alta cuotas en estado 'Pendiente'");
            if (cuota.FecVto < DateTime.Now) return Result<bool>.Failure("La fecha de vencimiento de una nueva cuota no puede ser anterior a hoy");
            
            if (cuota.Interes <= 0) return Result<bool>.Failure("Revise el interes de la cuota"); 
            if (cuota.Monto <= 0) return Result<bool>.Failure("El valor de la cuota no puede ser cero");
            if (cuota.NroCuota <= 0) return Result<bool>.Failure("Ingrese un numero de cuota valido");

            // CORRECCION: Inicializar SaldoPendiente
            cuota.SaldoPendiente = cuota.Monto;

            var result = await _cuota.AddCuota(cuota);
            return Result<bool>.Success(result > 0);
        }
        catch (Exception ex)
        {
            return Result<bool>.Failure($"Error al agregar cuota: {ex.Message}");
        }
    }

    public async Task<Result<List<Cuota>>> GetByFiltro(int? estado, int? mesVto, string? prestatario)
    {
        try
        {
            if (estado.HasValue && estado <= 0) return Result<List<Cuota>>.Failure("Ingrese un estado válido");
            if (mesVto.HasValue && (mesVto < 1 || mesVto > 12)) return Result<List<Cuota>>.Failure("El mes de vencimiento debe estar entre 1 y 12");
            if (!string.IsNullOrWhiteSpace(prestatario) && !prestatario.All(c => char.IsLetter(c) || char.IsWhiteSpace(c))) 
                return Result<List<Cuota>>.Failure("El nombre del prestatario solo puede contener letras");
            
            var cuotas = await _cuota.GetByFiltro(estado, mesVto, prestatario);
            return Result<List<Cuota>>.Success(cuotas);
        }
        catch (Exception ex)
        {
            return Result<List<Cuota>>.Failure($"Error al filtrar cuotas: {ex.Message}");
        }
    }

    public async Task<Result<Cuota>> GetById(int id)
    {
        try
        {
            if (id <= 0) return Result<Cuota>.Failure("Ingrese un identificador valido");
            var cuota = await _cuota.GetById(id);
            if (cuota == null) return Result<Cuota>.Failure("La cuota no existe");
            return Result<Cuota>.Success(cuota);
        }
        catch (Exception ex)
        {
            return Result<Cuota>.Failure($"Error al obtener cuota: {ex.Message}");
        }
    }

    public async Task<Result<bool>> UpdateCuota(Cuota cuota)
    {
        try
        {
            var nvaCuota = await _cuota.GetById(cuota.IdCuota);
            if (nvaCuota == null) return Result<bool>.Failure("La cuota no existe");

            if (nvaCuota.IdEstado == 3) return Result<bool>.Failure("La cuota ya está saldada");

            var totalPagado = cuota.Pagos.Sum(p => p.Monto);

            if (totalPagado > cuota.Monto) return Result<bool>.Failure("El total pagado supera el monto de la cuota");

            cuota.IdEstado = totalPagado == cuota.Monto ? 3 : 1;

            await _cuota.UpdateCuota(cuota);
            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
             return Result<bool>.Failure($"Error al actualizar cuota: {ex.Message}");
        }
    }

    // CORRECCION: Método automático para detectar y actualizar cuotas en mora
    public async Task<Result<int>> ActualizarCuotasVencidas()
    {
        try
        {
            // Buscar el ID del estado "Vencida"
            var estadoVencida = await _context.EstadosCuotas
                .Where(e => e.Descripcion == "Vencida")
                .Select(e => e.IdEstado)
                .FirstOrDefaultAsync();

            if (estadoVencida == 0)
            {
                // Fallback si no existe el estado
                return Result<int>.Failure("No se encontró el estado 'Vencida' en la base de datos");
            }

            // Buscar cuotas pendientes (IdEstado == 1) cuya fecha de vencimiento ya pasó
            var cuotasVencidas = await _context.Cuotas
                .Where(c => c.IdEstado == 1 
                         && c.FecVto < DateTime.Today)
                .ToListAsync();

            if (!cuotasVencidas.Any()) return Result<int>.Success(0);

            foreach (var cuota in cuotasVencidas)
            {
                cuota.IdEstado = estadoVencida;
            }

            var count = await _context.SaveChangesAsync();
            return Result<int>.Success(count);
        }
        catch (Exception ex)
        {
            return Result<int>.Failure($"Error al actualizar cuotas vencidas: {ex.Message}");
        }
    }

    public async Task<Result<List<Cuota>>> Getall(int idPrestamo)
    {
        try
        {
            var cuotas = await _cuota.GetAll(idPrestamo);
            return Result<List<Cuota>>.Success(cuotas);
        }
        catch (Exception ex)
        {
            return Result<List<Cuota>>.Failure($"Error al obtener cuotas: {ex.Message}");
        }
    }
}
