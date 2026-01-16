using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Repositories.Interfaces;

namespace TuCredito.Repositories.Implementations
{
    public class PagoRepository : IPagoRepository
    {
        private readonly TuCreditoContext _context;
        private readonly IMapper _mapper;
        public PagoRepository(TuCreditoContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
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

        public async Task<List<PagoOutputDTO>> GetPagoConFiltro(string? nombre, int? mes)
        {
            var query = _context.Pagos .AsNoTracking()
                        .Include(p => p.IdCuotaNavigation)
                        .ThenInclude(c => c.IdPrestamoNavigation)
                        .ThenInclude(pr => pr.DniPrestatarioNavigation)
                        .AsQueryable();

            if (!string.IsNullOrWhiteSpace(nombre))
            {
                query = query.Where(p =>
                    p.IdCuotaNavigation.IdPrestamoNavigation.DniPrestatarioNavigation.Nombre
                    .Contains(nombre));
            }

            if (mes.HasValue)
            {
                query = query.Where(p => p.FecPago.Month == mes.Value);
            }

            var pagos = await query.ToListAsync();

            return _mapper.Map<List<PagoOutputDTO>>(pagos); 
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

        public async Task<List<Pago>> GetPagoByIdPrestamo(int id) 
        {
            return await _context.Pagos.Where(p => p.IdCuotaNavigation.IdPrestamo == id)
                                       .ToListAsync();

        }
    }
}
