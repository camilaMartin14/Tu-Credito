using TuCredito.Models;
using TuCredito.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace TuCredito.Repositories.Implementations
{

    public class PrestamoRepository : IPrestamoRepository
    {
        private readonly TuCreditoContext _context;
        private readonly DbSet<Prestamo> _prestamo;

        public PrestamoRepository(TuCreditoContext context)
        {
            _context = context;
           _prestamo = context.Set<Prestamo>();
        }
        public async Task<List<Prestamo>> GetAllPrestamo()
        {
           return await _prestamo.ToListAsync();
        }

        public async Task<Prestamo> GetPrestamoById(int id)
        {
            return await _prestamo.FindAsync(id);
        }

        public Task<List<Prestamo>> GetPrestamoConFiltro(string filtro)
        {
            throw new NotImplementedException();
        }

        public Task<bool> PostPrestamo()
        {
            throw new NotImplementedException();
        }

        public Task<bool> SoftDelete(Prestamo NvoPrestamo)
        {
            throw new NotImplementedException();
        }
    }
}
