using TuCredito.Models;
using TuCredito.Services.Interfaces;
using TuCredito.DTOs;
using TuCredito.Repositories.Interfaces;
using System.Globalization;

namespace TuCredito.Services.Implementations

{
    public class CuotaService : ICuotaService
    {
        private readonly IPrestamoService _prestamo;
        private readonly ICuotaRepository _cuota;
        public CuotaService(IPrestamoService prestamo, ICuotaRepository cuota)
        {
            _prestamo = prestamo;
            _cuota = cuota;
        }
        public async Task<bool> AddCuota(Cuota cuota)
        {
            if (cuota.IdPrestamo <= 0) throw new ArgumentException("La cuota debe estar asociada a un préstamo");

            var prestamo = await _prestamo.GetPrestamoById(cuota.IdPrestamo);
            if (prestamo == null) throw new ArgumentException("El préstamo no existe");
            
            if (prestamo.IdEstado == 2) throw new ArgumentException("No se pueden agregar cuotas a un préstamo inactivo"); // finalizado
            if (prestamo.IdEstado == 3) throw new ArgumentException("No se pueden agregar cuotas a un préstamo inactivo"); // eliminado
            if (cuota.IdEstado != 1) throw new ArgumentException("Solo se pueden dar de alta cuotas en estado 'Pendiente'");
            if (cuota.FecVto < DateTime.Now) throw new ArgumentException("La fecha de vencimiento de una nueva cuota no puede ser anterior a hoy");
            if (cuota.FecVto == null) throw new ArgumentException("Establezca una fecha de vencimiento"); // esto vendria del metodo GenerarCtas
            if (cuota.Interes <= 0) throw new ArgumentException("Revise el interes de la cuota"); 
            if (cuota.Monto <= 0) throw new ArgumentException("El valor de la cuota no puede ser cero");
            return await _cuota.AddCuota(cuota) > 0;
        }

        public async Task<List<Cuota>> GetByFiltro(int? estado, int? mesVto, string? prestatario)
        {
            if (estado.HasValue && estado <= 0) throw new ArgumentException("Ingrese un estado válido");
            if (mesVto.HasValue && (mesVto < 1 || mesVto > 12)) throw new ArgumentException("El mes de vencimiento debe estar entre 1 y 12");
            if (!string.IsNullOrWhiteSpace(prestatario) && !prestatario.All(char.IsLetter)) // espacios? 
                throw new ArgumentException("El nombre del prestatario solo puede contener letras");
            return await _cuota.GetByFiltro(estado, mesVto, prestatario);
        }

        public async Task<Cuota> GetById(int id)
        {
            if (id <= 0) throw new ArgumentException("Ingrese un identificador valido");
            if (id == null) throw new ArgumentException("Ingrese un identificador");
            return await _cuota.GetById(id);
        }

        public async Task<bool> UpdateCuota(Cuota cuota)
        {
            var nvaCuota = await _cuota.GetById(cuota.IdCuota);

            if (nvaCuota.IdEstado == 3) throw new ArgumentException("La cuota ya está saldada");

            var totalPagado = cuota.Pagos.Sum(p => p.Monto);

            if (totalPagado > cuota.Monto) throw new ArgumentException("El total pagado supera el monto de la cuota");

            cuota.IdEstado = totalPagado == cuota.Monto ? 3 : 1;

            await _cuota.UpdateCuota(cuota);
            return true;
        
    }
    }
}
