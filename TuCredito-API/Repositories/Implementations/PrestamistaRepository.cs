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
            return await _context.Prestamistas
                .FirstOrDefaultAsync(p => p.Correo == email);
        }

        public async Task<Prestamista?> ObtenerPrestamistaPorId(int idPrestamista)
        {
            return await _context.Prestamistas
                .FirstOrDefaultAsync(p => p.Id == idPrestamista);
        }

        public async Task<Prestamista?> ObtenerPrestamistaPorUsuario(string usuario)
        {
            return await _context.Prestamistas
                .FirstOrDefaultAsync(p => p.Usuario == usuario);
        }


        public async Task<int> RegistrarPrestamista(Prestamista p)
        {
            _context.Prestamistas.Add(p);
            await _context.SaveChangesAsync();
            return p.Id;
        }

        public async Task<bool> UpdatePrestamista(Prestamista prestamista)
        {
            _context.Prestamistas.Update(prestamista);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
