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
            IQueryable<Cuota> query = _context.Cuotas;

            if (estado.HasValue)
                query = query.Where(e => e.IdEstado == estado.Value);

            if (mesVto.HasValue)
                query = query.Where(e => e.FecVto.Month == mesVto.Value);

            if (!string.IsNullOrWhiteSpace(prestatario))
                query = query.Where(e =>
                    e.IdPrestamoNavigation != null &&
                    e.IdPrestamoNavigation.DniPrestatarioNavigation != null &&
                    e.IdPrestamoNavigation.DniPrestatarioNavigation.Nombre == prestatario
                );

            return await query.ToListAsync();
        }

        public async Task<Cuota?> GetById(int id)
        {
             return await _context.Cuotas.FindAsync(id);
           
        }

        public async Task<bool> UpdateCuota(Cuota cuota) // 5 reprogramada, 3 saldada, nvo monto p pap parcial 
        {
            _context.Cuotas.Update(cuota);
            return await _context.SaveChangesAsync() >0 ;
              /*var cuotaEdit = await _context.Cuotas.FindAsync(cuota.IdCuota);
              if (cuotaEdit == null) { return false; }
            
              { 
                  cuotaEdit.IdEstado = cuota.IdEstado; 
                  cuotaEdit.Monto = cuota.Monto;
              }
              await _context.SaveChangesAsync();
              return true; */
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
