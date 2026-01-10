using TuCredito.Models;
using TuCredito.Services.Interfaces;
using TuCredito.DTOs;

namespace TuCredito.Services.Implementations

{
    public class CuotaService : ICuotaService
    {
        private readonly IPrestamoService _prestamo;
        public CuotaService(IPrestamoService prestamo)
        {
            _prestamo = prestamo;
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
        }

        public Task<List<Cuota>> GetByFiltro(int? estado, int? mesVto, string? prestatario)
        {
            throw new NotImplementedException();
        }

        public Task<Cuota> GetById(int id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateCuota(Cuota cuota)
        {
            throw new NotImplementedException();
        }
    }
}
