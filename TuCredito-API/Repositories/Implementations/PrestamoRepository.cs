using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Repositories.Interfaces;


namespace TuCredito.Repositories.Implementations
{

    public class PrestamoRepository : IPrestamoRepository
    {
        private readonly TuCreditoContext _context;
        private readonly DbSet<Prestamo> _prestamo;
        private readonly DbSet<Cuota> _cuota;
        private readonly IMapper _mapper;

        public PrestamoRepository(TuCreditoContext context, IMapper mapper)
        {
            _context = context;
            _prestamo = context.Set<Prestamo>();
            _cuota = context.Set<Cuota>();
            _mapper = mapper;

        }
        public async Task<List<PrestamoDTO>> GetAllPrestamo()
        {
            var Lista = await _prestamo.ToListAsync(); 
            return _mapper.Map<List<PrestamoDTO>>(Lista);
        }

        public async Task<PrestamoDTO> GetPrestamoById(int id)
        {
            var prestamo = await _prestamo.FindAsync(id); 
            return _mapper.Map<PrestamoDTO>(prestamo);
        }

        public async Task<List<PrestamoDTO>> GetPrestamoConFiltro(string? nombre, int? estado, int? mesVto, int? anio)
        {           
            var query = _prestamo
                .Include(p => p.DniPrestatarioNavigation)
                .Include(p => p.Cuota)
                .AsQueryable();

            if (!string.IsNullOrEmpty(nombre))
                query = query.Where(p => p.DniPrestatarioNavigation.Nombre.Contains(nombre));

            if (estado.HasValue)
                query = query.Where(p => p.IdEstado == estado.Value);

            if (mesVto.HasValue && anio.HasValue)
                query = query.Where(p => p.Cuota.Any(c =>
                    c.FecVto.Month == mesVto.Value &&
                    c.FecVto.Year == anio.Value));

            var resultado = await query.ToListAsync();
            return _mapper.Map<List<PrestamoDTO>>(resultado);
        }

        public async Task<bool> PostPrestamo(PrestamoDTO NewPrestamo)
        {
            var prestamo = _mapper.Map<Prestamo>(NewPrestamo); 
            _prestamo.Add(prestamo); 
            await _context.SaveChangesAsync(); 
            return true;
        }

        public async Task<bool> SoftDelete(int id) 
        {
            var prestamo = await _prestamo.FindAsync(id); 
            if (prestamo == null) return false;
            if (prestamo.IdEstado == 1) return false;
            prestamo.IdEstado = 2; // Cambio de estado ---> 1 activo, 2 finalizado, 3 eliminado
            _prestamo.Update(prestamo); 
            await _context.SaveChangesAsync(); 
            return true;
        }

        public async Task<bool> TienePagosPendientes(int idPrestamo) 
        { 
            
            return await _context.Cuotas.Where(c => c.IdPrestamo == idPrestamo)
                                        .AnyAsync(c => _context.Pagos
                                        .Where(p => p.IdCuota == c.IdCuota)
                                        .Sum(p => p.Monto) < c.Monto); 
        }


    }
}
