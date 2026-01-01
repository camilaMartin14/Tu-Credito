using TuCredito.DTOs;
using TuCredito.Repositories.Interfaces;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations
{
    public class PrestamoService : IPrestamoService
    {
        private readonly IPrestamoRepository _repo;
        public PrestamoService(IPrestamoRepository repo)
        {
            _repo = repo;
        }
        public async Task<List<PrestamoDTO>> GetAllPrestamo() // no se me ocurrio ninguna 
        {
            return await _repo.GetAllPrestamo();
        }

        public async Task<PrestamoDTO> GetPrestamoById(int id) // que el id sea + q 0 y q exista
        {
            if (id <= 0) throw new ArgumentException("ID inválido"); 
            var prestamo = await _repo.GetPrestamoById(id); 
            if (prestamo == null) throw new Exception("Préstamo no encontrado");
            return prestamo;
        }

        public Task<List<PrestamoDTO>> GetPrestamoConFiltro(string? nombre, int? estado, int? mesVto, int? anio)
        {
            if (!string.IsNullOrWhiteSpace(nombre) && nombre.Any(char.IsDigit))
                throw new ArgumentException("El nombre solo puede contener letras");
            //el estado lo manejaria con un cboBox desde el front
            if (mesVto > 12 || mesVto < 1) throw new ArgumentException("El mes debe estar contenido entre 1 y 12");
            if (estado.Value == 2 && mesVto.HasValue && anio.HasValue) 
            { 
                var fechaFiltro = new DateTime(anio.Value, mesVto.Value, 1); 
                if (fechaFiltro > DateTime.Today) 
                throw new ArgumentException("Solo se pueden consultar cuotas posteriores para prestamos activos"); 
            }
            return _repo.GetPrestamoConFiltro(nombre, estado, mesVto, anio);
        }

        public Task<bool> PostPrestamo(PrestamoDTO NvoPrestamo)
        {
            throw new NotImplementedException();
        }

        public Task<bool> SoftDelete(int id)
        {
            throw new NotImplementedException();
        }
    }
}
