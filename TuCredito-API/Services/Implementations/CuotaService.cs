using Microsoft.EntityFrameworkCore;
using TuCredito.Core;
using TuCredito.Models;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations
{
    public class CuotaService : ICuotaService
    {
        private readonly TuCreditoContext _context;

        
        private const int ESTADO_PENDIENTE = 1;
        private const int ESTADO_SALDADA = 3;

        public CuotaService(TuCreditoContext context)
        {
            _context = context;
        }

        public async Task<Result<bool>> AddCuota(Cuota cuota)
        {
            try
            {
                if (cuota.IdPrestamo <= 0)
                    return Result<bool>.Failure("La cuota debe estar asociada a un préstamo.");

                var prestamo = await _context.Prestamos.FindAsync(cuota.IdPrestamo);
                if (prestamo == null)
                    return Result<bool>.Failure("El préstamo no existe.");

                if (prestamo.IdEstado == 2)
                    return Result<bool>.Failure("No se pueden agregar cuotas a un préstamo finalizado.");

                if (prestamo.IdEstado == 3)
                    return Result<bool>.Failure("No se pueden agregar cuotas a un préstamo eliminado.");

                if (cuota.IdEstado != ESTADO_PENDIENTE)
                    return Result<bool>.Failure("Solo se pueden dar de alta cuotas en estado 'Pendiente'.");

                if (cuota.FecVto.Date < DateTime.Today)
                    return Result<bool>.Failure("La fecha de vencimiento de una nueva cuota no puede ser anterior a hoy.");

                if (cuota.Interes <= 0)
                    return Result<bool>.Failure("Revise el interés de la cuota.");

                if (cuota.Monto <= 0)
                    return Result<bool>.Failure("El monto de la cuota debe ser mayor que cero.");

                if (cuota.NroCuota <= 0)
                    return Result<bool>.Failure("Ingrese un número de cuota válido.");

                // Inicializar saldo pendiente
                cuota.SaldoPendiente = cuota.Monto;

                await _context.Cuotas.AddAsync(cuota);
                var result = await _context.SaveChangesAsync();

                return Result<bool>.Success(result > 0);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure($"Error al agregar la cuota: {ex.Message}");
            }
        }

        public async Task<Result<List<Cuota>>> GetByFiltro(int? estado, int? mesVto, string? prestatario)
        {
            try
            {
                if (estado.HasValue && estado.Value <= 0)
                    return Result<List<Cuota>>.Failure("Ingrese un estado válido.");

                if (mesVto.HasValue && (mesVto.Value < 1 || mesVto.Value > 12))
                    return Result<List<Cuota>>.Failure("El mes de vencimiento debe estar entre 1 y 12.");

                if (!string.IsNullOrWhiteSpace(prestatario) &&
                    !prestatario.All(c => char.IsLetter(c) || char.IsWhiteSpace(c)))
                    return Result<List<Cuota>>.Failure("El nombre del prestatario solo puede contener letras.");

                var query = _context.Cuotas
                    .Include(c => c.IdPrestamoNavigation)
                        .ThenInclude(p => p.DniPrestatarioNavigation)
                    .AsQueryable();

                if (estado.HasValue)
                    query = query.Where(c => c.IdEstado == estado.Value);

                if (mesVto.HasValue)
                    query = query.Where(c => c.FecVto.Month == mesVto.Value);

                if (!string.IsNullOrWhiteSpace(prestatario))
                    query = query.Where(c =>
                        c.IdPrestamoNavigation.DniPrestatarioNavigation.Nombre.Contains(prestatario));

                var cuotas = await query.ToListAsync();
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
                if (id <= 0)
                    return Result<Cuota>.Failure("Ingrese un identificador válido.");

                var cuota = await _context.Cuotas.FindAsync(id);
                if (cuota == null)
                    return Result<Cuota>.Failure("La cuota no existe.");

                return Result<Cuota>.Success(cuota);
            }
            catch (Exception ex)
            {
                return Result<Cuota>.Failure($"Error al obtener la cuota: {ex.Message}");
            }
        }

        public async Task<Result<bool>> UpdateCuota(Cuota cuota)
        {
            try
            {
                if (cuota.IdCuota <= 0)
                    return Result<bool>.Failure("ID de cuota inválido.");

                // Traer la cuota real de BD
                var dbCuota = await _context.Cuotas.FirstOrDefaultAsync(c => c.IdCuota == cuota.IdCuota);
                if (dbCuota == null)
                    return Result<bool>.Failure("La cuota no existe.");

                if (dbCuota.IdEstado == ESTADO_SALDADA)
                    return Result<bool>.Failure("La cuota ya está saldada.");

                // Total pagado desde la BD (no desde lo que viene en el request)
                var totalPagado = await _context.Pagos
                    .Where(p => p.IdCuota == dbCuota.IdCuota)
                    .SumAsync(p => (decimal?)p.Monto) ?? 0m;

                if (totalPagado > dbCuota.Monto)
                    return Result<bool>.Failure("El total pagado supera el monto de la cuota.");

                // Actualizar saldo pendiente
                dbCuota.SaldoPendiente = dbCuota.Monto - totalPagado;

                // Actualizar estado según saldo
                dbCuota.IdEstado = dbCuota.SaldoPendiente == 0m
                    ? ESTADO_SALDADA
                    : ESTADO_PENDIENTE;

                _context.Cuotas.Update(dbCuota);
                await _context.SaveChangesAsync();

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure($"Error al actualizar la cuota: {ex.Message}");
            }
        }

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
                    return Result<int>.Failure("No se encontró el estado 'Vencida' en la base de datos.");

                // Cuotas pendientes cuya fecha ya venció
                var cuotasVencidas = await _context.Cuotas
                    .Where(c => c.IdEstado == ESTADO_PENDIENTE && c.FecVto.Date < DateTime.Today)
                    .ToListAsync();

                if (!cuotasVencidas.Any())
                    return Result<int>.Success(0);

                foreach (var c in cuotasVencidas)
                    c.IdEstado = estadoVencida;

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
                if (idPrestamo <= 0)
                    return Result<List<Cuota>>.Failure("Ingrese un préstamo válido.");

                var cuotas = await _context.Cuotas
                    .Where(c => c.IdPrestamo == idPrestamo)
                    .ToListAsync();

                return Result<List<Cuota>>.Success(cuotas);
            }
            catch (Exception ex)
            {
                return Result<List<Cuota>>.Failure($"Error al obtener cuotas: {ex.Message}");
            }
        }
    }
}
