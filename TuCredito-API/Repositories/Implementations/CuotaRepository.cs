using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using TuCredito.Models;
using TuCredito.Repositories.Interfaces;

namespace TuCredito.Repositories.Implementations
{
    public class CuotaRepository : ICuotaRepository
    {
        private readonly TuCreditoContext _context;
        public CuotaRepository(TuCreditoContext context)
        {
            _context = context;
        }       
        public async Task<List<Cuota>> GetByFiltro(int? estado, int? mesVto, string? prestatario)
        {
            var cuotas = await _context.Cuotas.Where(e => e.IdEstado == estado 
                                                  || e.IdPrestamoNavigation.DniPrestatarioNavigation.Nombre == prestatario 
                                                  || e.FecVto.Month == mesVto)
                                              .ToListAsync();
            return cuotas;
        }

        public async Task<Cuota?> GetById(int id)
        {
             return await _context.Cuotas.FindAsync(id);
           
        }

        public async Task<bool> UpdateCuota(int idCuota, int nvoEstado) // solo para reprogramarla
        {
            var cuota = await _context.Cuotas.FindAsync(idCuota);
            if (cuota == null) { return false; }
            cuota.IdEstado = nvoEstado;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> AddCuota(Cuota cuota)
        {
            await _context.Cuotas.AddAsync(cuota); 
            return await _context.SaveChangesAsync();
        }
        public async Task<Cuota> GetUltimaPendiente(int IdPrestamo)
        {
            var ultCuota = await _context.Cuotas.Where(c => c.IdPrestamo == IdPrestamo && (c.IdEstado == 1)) // 1 pendiente
                                        .OrderByDescending(c => c.NroCuota)
                                        .FirstOrDefaultAsync();
            if (ultCuota == null) throw new Exception("No se encontró ninguna cuota pendiente"); 

            return ultCuota;
        }
    }
}
