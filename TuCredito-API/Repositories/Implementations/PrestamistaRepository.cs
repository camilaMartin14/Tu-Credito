using Microsoft.EntityFrameworkCore;
using TuCredito.Models;
using TuCredito.Repositories.Interfaces;

namespace TuCredito.Repositories.Implementations
{
    public class PrestamistaRepository : IPrestamistaRepository
    {
        private readonly TuCreditoContext _context;
        public PrestamistaRepository(TuCreditoContext context)
        {
            _context = context;
        }
        public async Task<Prestamista?> ObtenerPrestamistaPorEmail(string email)
        {
            return await _context.Prestamista
                .FirstOrDefaultAsync(p => p.Correo == email);
        }

        public async Task<Prestamista?> ObtenerPrestamistaPorId(int idPrestamista)
        {
            return await _context.Prestamista
                .FirstOrDefaultAsync(p => p.Id == idPrestamista);
        }

        public async Task<int> RegistrarPrestamista(Prestamista p)
        {
            _context.Prestamista.Add(p);
            await _context.SaveChangesAsync();
            return p.Id;
        }
    }
}
