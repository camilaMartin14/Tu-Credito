using TuCredito.Models;
using TuCredito.Repositories.Implementations;
using TuCredito.Repositories.Interfaces;
using TuCredito.Services.Interfaces; 
namespace TuCredito.Services.Implementations
{
    public class PagoService : IPagoService

    {
        private readonly IPagoRepository _pago;
        private readonly ICuotaRepository _cuota;
        public PagoService(IPagoRepository pago, ICuotaRepository cuota)
        {
            _pago = pago;
            _cuota = cuota;
        }
        public Task<List<Pago>> GetAllPagos() // AllActivos. 
        {
            return _pago.GetAllPagos();
        }

        public Task<Pago> GetPagoById(int id)
        {
            if (id <= 0) { throw new ArgumentException("Ingrese un identificador valido"); }
            if (id == null) { throw new ArgumentException("Ingrese un identificador valido"); }
            return _pago.GetPagoById(id);
        }

        public Task<List<Pago>> GetPagoConFiltro(string? nombre, int? mes)
        {
            if (string.IsNullOrWhiteSpace(nombre) || nombre.Any(char.IsDigit)) { throw new ArgumentException("El nombre solo puede contener letras"); }

            if (mes > 12 || mes < 1) { throw new ArgumentException("El mes debe estar contenido entre 1 y 12"); }

            return _pago.GetPagoConFiltro(nombre, mes);
        }

        public async Task<bool> NewPago(Pago pago)
        {

            if (pago.Monto <= 0) { throw new ArgumentException("El monto del pago debe ser mayor a cero"); }
                
            var cuota = await _cuota.GetById(pago.IdCuota);

            if (cuota == null) { throw new ArgumentException("Nro de cuota incorrecto"); }

            if (cuota.IdEstado == 3) { throw new ArgumentException("La cuota ya se encuentra saldada"); }

            if (pago.Monto > cuota.Monto) { throw new InvalidOperationException("El monto del pago supera el saldo pendiente de la cuota"); }

            
            await _pago.NewPago(pago);

            
            cuota.Monto -= pago.Monto; //actualiza el monto 

            if (cuota.Monto == 0)
            {
                cuota.IdEstado = 3; //cambia el estado si quedo saldada
            }

            await _cuota.UpdateCuota(cuota);

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

        public async void RegistrarPago(int IdCuota, int montoPagado)
        {
            var cuota = await _cuota.GetById(IdCuota); // de donde vendria el dato? deberia navegar el prestamo 
            var estado = cuota.IdEstado;
            if (cuota == null) throw new Exception("Cuota no encontrada");
            cuota.Pagos.Add(new Pago { Monto = montoPagado, FecPago = DateTime.Now });
            if (cuota.Pagos.Sum(p => p.Monto) >= cuota.Monto) cuota.IdEstado = 3; await _cuota.UpdateCuota(cuota); // 3 = saldada
            if (cuota.Pagos.Sum(p => p.Monto) < cuota.Monto) cuota.IdEstado = 1; await _cuota.UpdateCuota(cuota); // pendiente - deberiamos manejar el cuanto.
        }

        public async Task RegistrarPagoAnticipado(int prestamoId, int cuotaId, decimal monto)
        {
            var prestamo = await _prestamo.GetPrestamoById(prestamoId);
            if (prestamo == null)
                throw new Exception("Préstamo no encontrado");

            var cuota = await _cuota.GetById(cuotaId);
            if (cuota == null)
                throw new Exception("Cuota no encontrada");

            var ultimaPendiente = _cuota.GetUltimaPendiente(prestamoId);
            if (ultimaPendiente == null)
                throw new Exception("No hay cuotas pendientes para cancelar anticipadamente");

            if (cuota.IdCuota != ultimaPendiente.Id)
                throw new Exception("Solo se permite pagar anticipadamente la última cuota pendiente");

            cuota.Pagos.Add(new Pago
            {
                Monto = monto,
                FecPago = DateTime.Now
            });

            if (cuota.Pagos.Sum(p => p.Monto) >= cuota.Monto)
                cuota.IdEstado = 3; // Pagada
            else
                cuota.IdEstado = 1; // Parcial

            await _cuota.UpdateCuota(cuota);
        }
    }
}
