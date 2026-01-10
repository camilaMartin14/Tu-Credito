using Microsoft.EntityFrameworkCore;
using TuCredito.Models;
using TuCredito.Repositories.Interfaces;

namespace TuCredito.Repositories.Implementations
{
    public class PagoRepository : IPagoRepository
    {
        private readonly TuCreditoContext _context;
        public PagoRepository(TuCreditoContext context)
        {
            _context = context;
        }
        public async Task<List<Pago>> GetAllPagos()
        {
            var pagosActivos = await _context.Pagos.Where(e => e.Estado == "Registrado").ToListAsync(); // "registrado" deberia venir del front
            return pagosActivos;
        }

        public async Task<Pago> GetPagoById(int id)
        {
            return await _context.Pagos.FindAsync(id);
        }

        public async Task<List<Pago>> GetPagoConFiltro(string? nombre, int? mes)
        {
            var lista = _context.Pagos.Include(p => p.IdCuotaNavigation)
                                      .ThenInclude(c => c.IdPrestamoNavigation).AsQueryable();

            if (!string.IsNullOrWhiteSpace(nombre))
            {
                lista = lista.Where(p =>p.IdCuotaNavigation.IdPrestamoNavigation.DniPrestatarioNavigation.Nombre
                             .Contains(nombre));
            }

            if (mes.HasValue)
            {
                lista = lista.Where(p =>p.FecPago.Month == mes.Value);
            }

            return await lista.ToListAsync();
        }

        public async Task<bool> NewPago(Pago pago)
        {
            await _context.Pagos.AddAsync(pago);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdatePago(int id, string estado) // "eliminado" deberia venir del front 
        {
            var pago = await _context.Pagos.FindAsync(id);
            if (pago != null) 
            {
                pago.Estado = estado;
            }
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
