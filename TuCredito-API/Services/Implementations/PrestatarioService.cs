using Microsoft.EntityFrameworkCore;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations
{
    public class PrestatarioService : IPrestatarioService
    {
        private readonly TuCreditoContext _context;

        public PrestatarioService(TuCreditoContext context)
        {
            _context = context;
        }

        public async Task<int> CrearAsync(Prestatario prestatario)
        {
            if (prestatario == null) throw new ArgumentNullException(nameof(prestatario));

            if (string.IsNullOrWhiteSpace(prestatario.Nombre))
                throw new ArgumentException("El nombre es obligatorio.");

            if (prestatario.Nombre.Any(char.IsDigit))
                throw new ArgumentException("El nombre solo puede contener letras.");

            if (prestatario.Dni <= 0)
                throw new ArgumentException("El DNI es inválido.");

            // Ajustá si tu PK/unique no es DNI
            var existe = await _context.Prestatarios.AnyAsync(p => p.Dni == prestatario.Dni);
            if (existe)
                throw new ArgumentException("Ya existe un prestatario con ese DNI.");

            await _context.Prestatarios.AddAsync(prestatario);
            await _context.SaveChangesAsync();

          
            return prestatario.Dni;
        }

        public async Task<bool> ActualizarAsync(Prestatario prestatario)
        {
            if (prestatario == null) throw new ArgumentNullException(nameof(prestatario));

            if (prestatario.Dni <= 0)
                throw new ArgumentException("DNI inválido.");

            var existente = await _context.Prestatarios.FirstOrDefaultAsync(p => p.Dni == prestatario.Dni);
            if (existente == null)
                throw new ArgumentException("Prestatario no encontrado.");

            if (!string.IsNullOrWhiteSpace(prestatario.Nombre))
            {
                if (prestatario.Nombre.Any(char.IsDigit))
                    throw new ArgumentException("El nombre solo puede contener letras.");

                existente.Nombre = prestatario.Nombre;
                existente.Apellido = prestatario.Apellido;
                existente.Correo = prestatario.Correo;
                existente.Telefono = prestatario.Telefono;
                existente.Domicilio = prestatario.Domicilio;
            
            }

            

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CambiarEstadoAsync(int dni, bool activo)
        {
            if (dni <= 0)
                throw new ArgumentException("DNI inválido.");

            var existente = await _context.Prestatarios.FirstOrDefaultAsync(p => p.Dni == dni);
            if (existente == null)
                throw new ArgumentException("Prestatario no encontrado.");

            
            existente.EsActivo = activo;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Prestatario?> ObtenerPorDniAsync(int dni)
        {
            if (dni <= 0)
                throw new ArgumentException("DNI inválido.");

            return await _context.Prestatarios.FirstOrDefaultAsync(p => p.Dni == dni);
        }

        public async Task<List<Prestatario>> ObtenerConFiltrosAsync(PrestatarioDTO filtro)
        {
            
            filtro ??= new PrestatarioDTO();

            var query = _context.Prestatarios.AsQueryable();

            
            if (filtro.Dni.HasValue && filtro.Dni.Value > 0)
                query = query.Where(p => p.Dni == filtro.Dni.Value);

            if (!string.IsNullOrWhiteSpace(filtro.Nombre))
                query = query.Where(p => p.Nombre.Contains(filtro.Nombre));

            if (filtro.EsActivo.HasValue)
                query = query.Where(p => p.EsActivo == filtro.EsActivo.Value);

            return await query.ToListAsync();
        }
    }
}
