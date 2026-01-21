using TuCredito.Models;
using TuCredito.Repositories.Implementations;
using TuCredito.Repositories.Interfaces;
using TuCredito.Services.Interfaces;
using TuCredito.DTOs;
using Microsoft.EntityFrameworkCore;

namespace TuCredito.Services.Implementations;
    public class PagoService : IPagoService

    {
        private readonly IPagoRepository _pago;
        private readonly ICuotaRepository _cuotaRepo;
        private readonly IPrestamoRepository _prestamo;
        private readonly TuCreditoContext _context;

        public PagoService(IPagoRepository pago, ICuotaRepository cuotaRepo, IPrestamoRepository prestamo, TuCreditoContext context)
        {
            _pago = pago;
            _cuotaRepo = cuotaRepo;
            _prestamo = prestamo;
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

        //  un pago único por cuota.
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
                
                if (cuotaObjetivo.IdEstado == 3) throw new ArgumentException("La cuota ya se encuentra saldada");

                // Validar que el pago no exceda el saldo de la cuota
                decimal saldoActualCuota = cuotaObjetivo.SaldoPendiente ?? cuotaObjetivo.Monto;
                
                if (pago.Monto > saldoActualCuota)
                    throw new InvalidOperationException($"El pago ({pago.Monto}) excede el saldo pendiente de la cuota ({saldoActualCuota}).");

                cuotaObjetivo.SaldoPendiente = saldoActualCuota - pago.Monto;

                if (cuotaObjetivo.SaldoPendiente <= 0)
                {
                    cuotaObjetivo.IdEstado = 3; // Saldada
                    cuotaObjetivo.SaldoPendiente = 0;
                }
                else
                {
                    cuotaObjetivo.IdEstado = 1; // Sigue Pendiente (o parcial)
                }

                var prestamo = cuotaObjetivo.IdPrestamoNavigation;
                
                prestamo.SaldoRestante -= pago.Monto;

                if (prestamo.SaldoRestante <= 0)
                {
                    prestamo.SaldoRestante = 0;
                    
                    bool quedanOtrasPendientes = await _context.Cuotas
                        .AnyAsync(c => c.IdPrestamo == prestamo.IdPrestamo && c.IdCuota != cuotaObjetivo.IdCuota && c.IdEstado != 3);
                    
                    if (!quedanOtrasPendientes && cuotaObjetivo.IdEstado == 3)
                    {
                        prestamo.IdEstado = 2; // Finalizado
                    }
                }
                else
                {
                    if (prestamo.IdEstado == 2) prestamo.IdEstado = 1; // reactivar si estaba finalizado erróneamente
                }

                pago.Estado = "Registrado";
                pago.Saldo = cuotaObjetivo.SaldoPendiente ?? 0; 
                
                _context.Pagos.Add(pago);

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

        public async Task<List<Pago>> GetPagoByIdPrestamo(int id)
        {
            return await _pago.GetPagoByIdPrestamo(id);
        }
    }
