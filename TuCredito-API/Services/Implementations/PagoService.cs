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
        private const int CUOTA_SALDADA = 2;

        private const int PRESTAMO_ACTIVO = 1;
        private const int PRESTAMO_FINALIZADO = 2;
        private const int PRESTAMO_ELIMINADO = 3;

        private const string PAGO_REGISTRADO = "Aprobado";

        public PagoService(TuCreditoContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<Pago>> GetAllPagos()
        {
            return await _context.Pagos
                .Include(p => p.IdCuotaNavigation)
                    .ThenInclude(c => c.IdPrestamoNavigation)
                        .ThenInclude(pr => pr.DniPrestatarioNavigation)
                .OrderByDescending(p => p.FecPago)
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
                    p.IdCuotaNavigation.IdPrestamoNavigation.DniPrestatarioNavigation.Nombre.Contains(nombre) ||
                    p.IdCuotaNavigation.IdPrestamoNavigation.DniPrestatarioNavigation.Apellido.Contains(nombre) ||
                    p.IdCuotaNavigation.IdPrestamoNavigation.DniPrestatario.ToString().Contains(nombre));
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
                if (pago.Cotizacion <= 0) pago.Cotizacion = 1;

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

                var saldoActualCuota = cuotaObjetivo.SaldoPendiente ?? cuotaObjetivo.Monto;

                var montoAmortizado = pago.Monto + pago.Descuento - pago.Recargo;

                if (montoAmortizado <= 0)
                     throw new InvalidOperationException("El pago neto (ajustado por descuentos/recargos) no reduce la deuda.");

                if (montoAmortizado > saldoActualCuota)
                    throw new InvalidOperationException(
                        $"El pago amortizable ({montoAmortizado}) excede el saldo pendiente de la cuota ({saldoActualCuota}).");

                cuotaObjetivo.SaldoPendiente = saldoActualCuota - montoAmortizado;

                if (cuotaObjetivo.SaldoPendiente <= 0)
                {
                    cuotaObjetivo.IdEstado = CUOTA_SALDADA;
                    cuotaObjetivo.SaldoPendiente = 0;
                }
                else
                {
                    cuotaObjetivo.IdEstado = CUOTA_PENDIENTE;
                }

                prestamo.SaldoRestante -= montoAmortizado;

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
                    if (prestamo.IdEstado == PRESTAMO_FINALIZADO)
                        prestamo.IdEstado = PRESTAMO_ACTIVO;
                }

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

            pago.Estado = estado;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RegistrarPagoAnticipadoAsync(Pago pago)
        {
            if (pago == null) throw new ArgumentNullException(nameof(pago));
            if (pago.IdCuota <= 0) throw new ArgumentException("Ingrese una cuota válida.");

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
