using TuCredito.Models;
using TuCredito.Repositories.Implementations;
using TuCredito.Repositories.Interfaces;
using TuCredito.Services.Interfaces;
using TuCredito.DTOs;
using Microsoft.EntityFrameworkCore;

namespace TuCredito.Services.Implementations
{
    public class PagoService : IPagoService

    {
        private readonly IPagoRepository _pago;
        private readonly ICuotaRepository _cuotaRepo;
        private readonly IPrestamoRepository _prestamo;
        private readonly ICuotaService _cuotaService;
        private readonly TuCreditoContext _context;

        public PagoService(IPagoRepository pago, ICuotaRepository cuotaRepo, IPrestamoRepository prestamo, ICuotaService cuotaService, TuCreditoContext context)
        {
            _pago = pago;
            _cuotaRepo = cuotaRepo;
            _prestamo = prestamo;
            _cuotaService = cuotaService;
            _context = context;
        }
        public Task<List<Pago>> GetAllPagos() // AllActivos. 
        {
            return _pago.GetAllPagos();
        }

        public Task<Pago> GetPagoById(int id)
        {
            if (id <= 0) { throw new ArgumentException("Ingrese un identificador valido"); }
            return _pago.GetPagoById(id);
        }

        public Task<List<PagoOutputDTO>> GetPagoConFiltro(string? nombre, int? mes)
        {
            if (nombre != null && nombre.Any(char.IsDigit)) throw new ArgumentException("El nombre solo puede contener letras");

            if (mes.HasValue && (mes < 1 || mes > 12)) throw new ArgumentException("El mes debe estar entre 1 y 12");

            return _pago.GetPagoConFiltro(nombre, mes);
        }

        // CORRECCION: Se implementó pago en cascada y recálculo de saldo por suma de cuotas
        public async Task<bool> NewPago(Pago pago)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (pago.Monto <= 0) throw new ArgumentException("El monto del pago debe ser mayor a cero");

                // Cargar Cuota objetivo
                var cuotaObjetivo = await _context.Cuotas
                    .Include(c => c.IdPrestamoNavigation)
                    .FirstOrDefaultAsync(c => c.IdCuota == pago.IdCuota);

                if (cuotaObjetivo == null) throw new ArgumentException("Nro de cuota incorrecto");

                var prestamo = cuotaObjetivo.IdPrestamoNavigation;

                // 1. Obtener todas las cuotas pendientes (o con saldo) del préstamo para calcular la deuda real total
                var cuotasPendientes = await _context.Cuotas
                    .Where(c => c.IdPrestamo == prestamo.IdPrestamo && (c.SaldoPendiente == null || c.SaldoPendiente > 0))
                    .OrderBy(c => c.FecVto) // Ordenar por fecha de vencimiento
                    .ToListAsync();

                // Calcular deuda total real antes del pago
                decimal deudaTotal = cuotasPendientes.Sum(c => c.SaldoPendiente ?? c.Monto);

                // Validar contra el total del préstamo
                if (pago.Monto > deudaTotal)
                    throw new InvalidOperationException($"El pago excede el saldo restante total del préstamo ({deudaTotal}).");

                // 2. Lógica de Pago en Cascada
                decimal montoRestantePago = pago.Monto;

                // Priorizar la cuota seleccionada: moverla al principio de la lista si está pendiente
                var cuotaSeleccionadaEnLista = cuotasPendientes.FirstOrDefault(c => c.IdCuota == pago.IdCuota);
                if (cuotaSeleccionadaEnLista != null)
                {
                    cuotasPendientes.Remove(cuotaSeleccionadaEnLista);
                    cuotasPendientes.Insert(0, cuotaSeleccionadaEnLista);
                }
                // Si la cuota seleccionada ya estaba pagada (no está en cuotasPendientes), el pago se aplicará a la siguiente más antigua (por el OrderBy inicial)

                foreach (var cuota in cuotasPendientes)
                {
                    if (montoRestantePago <= 0) break;

                    decimal saldoActualCuota = cuota.SaldoPendiente ?? cuota.Monto;
                    
                    // Cuanto pagamos de esta cuota: lo que queda del pago o la deuda total de la cuota
                    decimal montoAplicar = Math.Min(montoRestantePago, saldoActualCuota);

                    cuota.SaldoPendiente = saldoActualCuota - montoAplicar;
                    montoRestantePago -= montoAplicar;

                    // Actualizar estado de la cuota
                    if (cuota.SaldoPendiente <= 0)
                    {
                        cuota.IdEstado = 3; // Saldada
                        cuota.SaldoPendiente = 0; // Evitar negativos
                    }
                    else
                    {
                        cuota.IdEstado = 1; // Sigue Pendiente
                    }
                }

                // 3. Actualizar Préstamo: Recalcular SaldoRestante sumando las cuotas pendientes
                // Como ya modificamos las entidades en memoria (cuotasPendientes), la suma reflejará el nuevo estado
                prestamo.SaldoRestante = cuotasPendientes.Sum(c => c.SaldoPendiente ?? c.Monto);
                
                if (prestamo.SaldoRestante <= 0)
                {
                    prestamo.SaldoRestante = 0;
                    // Verificar si realmente no quedan cuotas (doble check)
                    bool quedanPendientesBD = await _context.Cuotas.AnyAsync(c => c.IdPrestamo == prestamo.IdPrestamo && c.IdEstado != 3 && !cuotasPendientes.Select(cp => cp.IdCuota).Contains(c.IdCuota));
                    // Nota: cuotasPendientes tiene todas las que tenían saldo. Si SaldoRestante es 0, todas deberían estar en 0.
                    
                    prestamo.IdEstado = 2; // Finalizado/Cancelado
                }
                else
                {
                    // Si el préstamo estaba finalizado pero (raro) se reactiva, o simplemente asegurar estado activo
                    if (prestamo.IdEstado == 2) prestamo.IdEstado = 1; 
                }

                // Registrar el pago
                pago.Estado = "Registrado";
                // Guardamos el saldo de la cuota principal para referencia histórica
                pago.Saldo = cuotaSeleccionadaEnLista?.SaldoPendiente ?? 0; 
                
                _context.Pagos.Add(pago);

                // Guardar todo atómicamente
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
            var pago = await _pago.GetPagoById(id);
            if (pago == null)
            {
                throw new ArgumentException("No se encontro el pago indicado");
            }
            pago.Estado = estado; // "elimidado", debe venir del front
            await _pago.UpdatePago(id, estado);
            return true;
    
        }

        public async Task<bool> RegistrarPagoAnticipadoAsync(Pago pago)
        {

             var cuota = await _cuotaRepo.GetById(pago.IdCuota);
            if (cuota == null)
                throw new ArgumentException("Cuota no encontrada");

            var prestamo = await _prestamo.GetPrestamoById(cuota.IdPrestamo);
            if (prestamo == null)
                throw new ArgumentException("Préstamo no encontrado");

            if (prestamo.IdEstado != 1)
                throw new ArgumentException("El préstamo no está activo");

            var ultimaPendiente = await _cuotaRepo.GetUltimaPendiente(cuota.IdPrestamo);
            if (ultimaPendiente == null)
                throw new ArgumentException("No hay cuotas pendientes para cancelar anticipadamente");

            if (cuota.IdCuota != ultimaPendiente.IdCuota)
                throw new ArgumentException("Solo se permite pagar anticipadamente la última cuota pendiente");

            await NewPago(pago);
            return true;
        }


    }
}
