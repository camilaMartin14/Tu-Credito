using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations
{
    public class PagoService : IPagoService
    {
        private readonly TuCreditoContext _context;
        private readonly IMapper _mapper;

        private const int CUOTA_PENDIENTE = 1;
        private const int CUOTA_SALDADA = 3;

        private const int PRESTAMO_ACTIVO = 1;
        private const int PRESTAMO_FINALIZADO = 2;
        private const int PRESTAMO_ELIMINADO = 3;

        private const string PAGO_REGISTRADO = "Registrado";

        public PagoService(TuCreditoContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<Pago>> GetAllPagos()
        {
            // “Registrado” NO debería venir del front, es un estado del sistema.
            return await _context.Pagos
                .Where(p => p.Estado == PAGO_REGISTRADO)
                .ToListAsync();
        }

        public async Task<Pago> GetPagoById(int id)
        {
            if (id <= 0) throw new ArgumentException("Ingrese un identificador válido.");

            var pago = await _context.Pagos.FindAsync(id);
            if (pago == null) throw new ArgumentException("No se encontró el pago indicado.");

            return pago;
        }

        public async Task<List<PagoOutputDTO>> GetPagoConFiltro(string? nombre, int? mes)
        {
            if (!string.IsNullOrWhiteSpace(nombre) && nombre.Any(char.IsDigit))
                throw new ArgumentException("El nombre solo puede contener letras.");

            if (mes.HasValue && (mes.Value < 1 || mes.Value > 12))
                throw new ArgumentException("El mes debe estar entre 1 y 12.");

            var query = _context.Pagos
                .AsNoTracking()
                .Include(p => p.IdCuotaNavigation)
                    .ThenInclude(c => c.IdPrestamoNavigation)
                        .ThenInclude(pr => pr.DniPrestatarioNavigation)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(nombre))
            {
                query = query.Where(p =>
                    p.IdCuotaNavigation.IdPrestamoNavigation.DniPrestatarioNavigation.Nombre.Contains(nombre));
            }

            if (mes.HasValue)
            {
                query = query.Where(p => p.FecPago.Month == mes.Value);
            }

            var pagos = await query.ToListAsync();
            return _mapper.Map<List<PagoOutputDTO>>(pagos);
        }

        // Un pago por cuota (puede ser parcial o total)
        public async Task<bool> NewPago(Pago pago)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                if (pago == null) throw new ArgumentNullException(nameof(pago));
                if (pago.IdCuota <= 0) throw new ArgumentException("Ingrese una cuota válida.");
                if (pago.Monto <= 0) throw new ArgumentException("El monto del pago debe ser mayor que cero.");

                // Cargar cuota objetivo + préstamo
                var cuotaObjetivo = await _context.Cuotas
                    .Include(c => c.IdPrestamoNavigation)
                    .FirstOrDefaultAsync(c => c.IdCuota == pago.IdCuota);

                if (cuotaObjetivo == null)
                    throw new ArgumentException("Número de cuota incorrecto.");

                if (cuotaObjetivo.IdEstado == CUOTA_SALDADA)
                    throw new ArgumentException("La cuota ya se encuentra saldada.");

                var prestamo = cuotaObjetivo.IdPrestamoNavigation;
                if (prestamo == null)
                    throw new InvalidOperationException("La cuota no tiene un préstamo asociado.");

                if (prestamo.IdEstado == PRESTAMO_ELIMINADO)
                    throw new ArgumentException("No se pueden registrar pagos de un préstamo eliminado.");

                // Saldo actual de la cuota
                var saldoActualCuota = cuotaObjetivo.SaldoPendiente ?? cuotaObjetivo.Monto;

                if (pago.Monto > saldoActualCuota)
                    throw new InvalidOperationException(
                        $"El pago ({pago.Monto}) excede el saldo pendiente de la cuota ({saldoActualCuota}).");

                // Actualizar cuota
                cuotaObjetivo.SaldoPendiente = saldoActualCuota - pago.Monto;

                if (cuotaObjetivo.SaldoPendiente <= 0)
                {
                    cuotaObjetivo.IdEstado = CUOTA_SALDADA;
                    cuotaObjetivo.SaldoPendiente = 0;
                }
                else
                {
                    cuotaObjetivo.IdEstado = CUOTA_PENDIENTE; // sigue pendiente (parcial)
                }

                // Actualizar préstamo
                prestamo.SaldoRestante -= pago.Monto;

                if (prestamo.SaldoRestante <= 0)
                {
                    prestamo.SaldoRestante = 0;

                    var quedanPendientes = await _context.Cuotas.AnyAsync(c =>
                        c.IdPrestamo == prestamo.IdPrestamo &&
                        c.IdEstado != CUOTA_SALDADA);

                    if (!quedanPendientes)
                        prestamo.IdEstado = PRESTAMO_FINALIZADO;
                }
                else
                {
                    // Si quedaba como finalizado por error, lo reactivamos
                    if (prestamo.IdEstado == PRESTAMO_FINALIZADO)
                        prestamo.IdEstado = PRESTAMO_ACTIVO;
                }

                // Completar pago
                pago.Estado = PAGO_REGISTRADO;
                pago.Saldo = cuotaObjetivo.SaldoPendiente ?? 0;

                await _context.Pagos.AddAsync(pago);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> UpdatePago(int id, string estado)
        {
            if (id <= 0) throw new ArgumentException("Ingrese un identificador válido.");
            if (string.IsNullOrWhiteSpace(estado)) throw new ArgumentException("Ingrese un estado válido.");

            var pago = await _context.Pagos.FindAsync(id);
            if (pago == null) throw new ArgumentException("No se encontró el pago indicado.");

            pago.Estado = estado; // Ideal: validar contra estados permitidos
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RegistrarPagoAnticipadoAsync(Pago pago)
        {
            if (pago == null) throw new ArgumentNullException(nameof(pago));
            if (pago.IdCuota <= 0) throw new ArgumentException("Ingrese una cuota válida.");

            // Traer cuota + préstamo
            var cuota = await _context.Cuotas
                .Include(c => c.IdPrestamoNavigation)
                .FirstOrDefaultAsync(c => c.IdCuota == pago.IdCuota);

            if (cuota == null) throw new ArgumentException("Cuota no encontrada.");

            var prestamo = cuota.IdPrestamoNavigation;
            if (prestamo == null) throw new ArgumentException("Préstamo no encontrado.");

            if (prestamo.IdEstado != PRESTAMO_ACTIVO)
                throw new ArgumentException("El préstamo no está activo.");

            // Última pendiente del préstamo
            var ultimaPendiente = await _context.Cuotas
                .Where(c => c.IdPrestamo == prestamo.IdPrestamo && c.IdEstado == CUOTA_PENDIENTE)
                .OrderByDescending(c => c.NroCuota)
                .FirstOrDefaultAsync();

            if (ultimaPendiente == null)
                throw new ArgumentException("No hay cuotas pendientes para cancelar anticipadamente.");

            if (cuota.IdCuota != ultimaPendiente.IdCuota)
                throw new ArgumentException("Solo se permite pagar anticipadamente la última cuota pendiente.");

            await NewPago(pago);
            return true;
        }

        public async Task<List<Pago>> GetPagoByIdPrestamo(int id)
        {
            if (id <= 0) throw new ArgumentException("Ingrese un préstamo válido.");

            return await _context.Pagos
                .Include(p => p.IdCuotaNavigation)
                .Where(p => p.IdCuotaNavigation.IdPrestamo == id)
                .ToListAsync();
        }
    }
}
