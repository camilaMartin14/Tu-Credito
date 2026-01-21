using Microsoft.EntityFrameworkCore;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Repositories.Interfaces;

namespace TuCredito.Repositories.Implementations;
    public class PrestatarioRepository : IPrestatarioRepository
    {
        private readonly TuCreditoContext _context;
        public PrestatarioRepository(TuCreditoContext context)
        {
            _context = context;
        }
        public async Task<bool> ActualizarAsync(Prestatario prestatario)
        {
            var existente = await _context.Prestatarios
                .FirstOrDefaultAsync(p => p.Dni == prestatario.Dni);

            if (existente == null)
                return false;

            _context.Entry(existente).CurrentValues.SetValues(prestatario);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> CambiarEstadoAsync(int dni, bool activo)
        {
            var prestatario = await _context.Prestatarios
        .FirstOrDefaultAsync(p => p.Dni == dni);

            if (prestatario == null)
                return false;

            prestatario.EsActivo = activo;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<int> CrearAsync(Prestatario prestatario)
        {
            _context.Prestatarios.Add(prestatario);
            await _context.SaveChangesAsync();
            return prestatario.Dni;
        }

        public async Task<List<Prestatario>> ObtenerConFiltrosAsync(PrestatarioDTO filtro)
        {
            var query = _context.Prestatarios
                .Include(p => p.IdGaranteNavigation)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filtro.Nombre))
                query = query.Where(p => p.Nombre.Contains(filtro.Nombre));

            if (filtro.EsActivo.HasValue)
                query = query.Where(p => p.EsActivo == filtro.EsActivo.Value);

            if (filtro.Dni.HasValue)
                query = query.Where(p => p.Dni == filtro.Dni.Value);

            return await query.ToListAsync();
        }

        public async Task<Prestatario?> ObtenerPorDniAsync(int dni)
        {
            return await _context.Prestatarios
                .Include(p => p.IdGaranteNavigation)
                .FirstOrDefaultAsync(p => p.Dni == dni);
        }
    }
