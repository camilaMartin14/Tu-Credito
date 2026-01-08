using TuCredito.Models;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations

{
    public class CuotaService : ICuotaService
    {
        public Task<bool> AddCuota(Cuota cuota)
        {
            throw new NotImplementedException();
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
