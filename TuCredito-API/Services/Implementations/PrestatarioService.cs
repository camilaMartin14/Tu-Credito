using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations
{
    public class PrestatarioService : IPrestatarioService
    {
        private readonly TuCreditoContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public PrestatarioService(TuCreditoContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private bool IsDemoUser()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            var name = user?.FindFirst(ClaimTypes.Name)?.Value;
            return name?.ToLower() == "demo";
        }

        private bool IsSeedData(int dni)
        {
            // DNIs del 10000001 al 10000020 son considerados datos semilla protegidos
            return dni >= 10000001 && dni <= 10000020;
        }

        public async Task<int> CrearAsync(Prestatario prestatario, CancellationToken cancellationToken = default)
        {
            if (prestatario == null) throw new ArgumentNullException(nameof(prestatario));

            if (IsDemoUser() && IsSeedData(prestatario.Dni))
                throw new InvalidOperationException("No se pueden crear prestatarios con DNI reservado para datos de prueba (10000001-10000020).");

            if (string.IsNullOrWhiteSpace(prestatario.Nombre))
                throw new ArgumentException("El nombre es obligatorio.");

            if (prestatario.Nombre.Any(char.IsDigit))
                throw new ArgumentException("El nombre solo puede contener letras.");

            if (prestatario.Dni <= 0)
                throw new ArgumentException("El DNI es inválido.");

            var existe = await _context.Prestatarios.AnyAsync(p => p.Dni == prestatario.Dni, cancellationToken);
            if (existe)
                throw new ArgumentException("Ya existe un prestatario con ese DNI.");

            if (prestatario.IdGaranteNavigation != null)
            {
                if (string.IsNullOrWhiteSpace(prestatario.IdGaranteNavigation.Dni))
                {
                    prestatario.IdGaranteNavigation = null;
                    prestatario.IdGarante = null;
                }
                else
                {
                    var garanteExistente = await _context.Garantes
                        .FirstOrDefaultAsync(g => g.Dni == prestatario.IdGaranteNavigation.Dni, cancellationToken);

                    if (garanteExistente != null)
                    {
                        prestatario.IdGaranteNavigation = garanteExistente;
                        prestatario.IdGarante = garanteExistente.IdGarante;
                    }
                    else
                    {
                        prestatario.IdGaranteNavigation.EsActivo = true;
                    }
                }
            }

            await _context.Prestatarios.AddAsync(prestatario, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

          
            return prestatario.Dni;
        }

        public async Task<bool> ActualizarAsync(Prestatario prestatario, CancellationToken cancellationToken = default)
        {
            if (prestatario == null) throw new ArgumentNullException(nameof(prestatario));

            if (prestatario.Dni <= 0)
                throw new ArgumentException("DNI inválido.");

            if (IsDemoUser() && IsSeedData(prestatario.Dni))
                throw new InvalidOperationException("No se pueden modificar los prestatarios de prueba protegidos.");

            var existente = await _context.Prestatarios.FirstOrDefaultAsync(p => p.Dni == prestatario.Dni, cancellationToken);
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

            

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> CambiarEstadoAsync(int dni, bool activo, CancellationToken cancellationToken = default)
        {
            if (dni <= 0)
                throw new ArgumentException("DNI inválido.");

            if (IsDemoUser() && IsSeedData(dni))
                throw new InvalidOperationException("No se puede cambiar el estado de los prestatarios de prueba protegidos.");

            var existente = await _context.Prestatarios.FirstOrDefaultAsync(p => p.Dni == dni, cancellationToken);
            if (existente == null)
                throw new ArgumentException("Prestatario no encontrado.");

            
            existente.EsActivo = activo;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<Prestatario?> ObtenerPorDniAsync(int dni, CancellationToken cancellationToken = default)
        {
            if (dni <= 0)
                throw new ArgumentException("DNI inválido.");

            return await _context.Prestatarios.FirstOrDefaultAsync(p => p.Dni == dni, cancellationToken);
        }

        public async Task<List<Prestatario>> ObtenerConFiltrosAsync(PrestatarioDTO filtro, CancellationToken cancellationToken = default)
        {
            
            filtro ??= new PrestatarioDTO();

            var query = _context.Prestatarios.AsQueryable();

            
            // Si viene DNI exacto, filtramos por él (prioridad alta)
            if (filtro.Dni.HasValue && filtro.Dni.Value > 0)
                query = query.Where(p => p.Dni == filtro.Dni.Value);

            if (!string.IsNullOrWhiteSpace(filtro.Nombre))
            {
                query = query.Where(p => 
                    p.Nombre.Contains(filtro.Nombre) || 
                    p.Apellido.Contains(filtro.Nombre) ||
                    p.Dni.ToString().Contains(filtro.Nombre));
            }

            if (filtro.EsActivo.HasValue)
                query = query.Where(p => p.EsActivo == filtro.EsActivo.Value);

            return await query.ToListAsync(cancellationToken);
        }
    }
}
