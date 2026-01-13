using TuCredito.Models;
using TuCredito.Repositories.Implementations;
using TuCredito.Repositories.Interfaces;
using TuCredito.Services.Interfaces;
using TuCredito.DTOs;
namespace TuCredito.Services.Implementations
{
    public class PagoService : IPagoService

    {
        private readonly IPagoRepository _pago;
        private readonly ICuotaRepository _cuotaRepo;
        private readonly IPrestamoRepository _prestamo;
        private readonly ICuotaService _cuotaService;
        public PagoService(IPagoRepository pago, ICuotaRepository cuotaRepo, IPrestamoRepository prestamo, ICuotaService cuotaService)
        {
            _pago = pago;
            _cuotaRepo = cuotaRepo;
            _prestamo = prestamo;
            _cuotaService = cuotaService;
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

        public async Task<bool> NewPago(Pago pago)
        {

            if (pago.Monto <= 0) { throw new ArgumentException("El monto del pago debe ser mayor a cero"); }
                
            var cuota = await _cuotaRepo.GetById(pago.IdCuota);

            if (cuota == null) { throw new ArgumentException("Nro de cuota incorrecto"); }

            if (cuota.IdEstado == 3) { throw new ArgumentException("La cuota ya se encuentra saldada"); }

            if (pago.Monto > cuota.Monto) { throw new InvalidOperationException("El monto del pago supera el saldo pendiente de la cuota"); }

            
            await _pago.NewPago(pago);

            
            var totalPagado = cuota.Pagos.Sum(p => p.Monto) + pago.Monto;

            if (totalPagado > cuota.Monto)
                throw new Exception("Excede el monto");

            cuota.IdEstado = totalPagado == cuota.Monto ? 3 : 1;

            await _cuotaRepo.UpdateCuota(cuota);

            return true;
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
