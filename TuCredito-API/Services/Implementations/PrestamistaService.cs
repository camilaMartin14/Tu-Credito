using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Security;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations
{
    public class PrestamistaService : IPrestamistaService
    {
        private readonly TuCreditoContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMapper _mapper;

        public PrestamistaService(
            TuCreditoContext context,
            IHttpContextAccessor httpContextAccessor,
            IMapper mapper)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;
        }

        
        public async Task<Prestamista?> LoginAsync(string email, string contrasenia, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(email)) return null;
            if (string.IsNullOrWhiteSpace(contrasenia)) return null;

            var cred = email.Trim();

            var prestamista = await _context.Prestamistas
                .FirstOrDefaultAsync(p => p.Usuario == cred || p.Correo == cred, cancellationToken);

            if (prestamista == null) return null;

            if (!PasswordHasher.Verify(contrasenia, prestamista.ContraseniaHash))
                return null;

            return prestamista;
        }

        public async Task<Prestamista?> ObtenerPrestamistaPorEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(email)) return null;

            return await _context.Prestamistas
                .FirstOrDefaultAsync(p => p.Correo == email, cancellationToken);
        }

        public async Task<Prestamista?> ObtenerPrestamistaPorIdAsync(int idPrestamista, CancellationToken cancellationToken = default)
        {
            if (idPrestamista <= 0) return null;

            return await _context.Prestamistas
                .FirstOrDefaultAsync(p => p.Id == idPrestamista, cancellationToken);
        }

        public async Task<int> RegistrarPrestamistaAsync(PrestamistaRegisterDto dto, CancellationToken cancellationToken = default)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            if (string.IsNullOrWhiteSpace(dto.Correo))
                throw new ArgumentException("El correo es obligatorio.");

            if (string.IsNullOrWhiteSpace(dto.Usuario))
                throw new ArgumentException("El usuario es obligatorio.");

            if (string.IsNullOrWhiteSpace(dto.Contrasenia))
                throw new ArgumentException("La contraseña es obligatoria.");

            var existeEmail = await _context.Prestamistas.AnyAsync(p => p.Correo == dto.Correo, cancellationToken);
            if (existeEmail)
                throw new Exception("El correo ya está registrado.");

            var existeUsuario = await _context.Prestamistas.AnyAsync(p => p.Usuario == dto.Usuario, cancellationToken);
            if (existeUsuario)
                throw new Exception("El nombre de usuario ya está registrado.");

            var prestamista = _mapper.Map<Prestamista>(dto);
            prestamista.ContraseniaHash = PasswordHasher.Hash(dto.Contrasenia);

            _context.Prestamistas.Add(prestamista);
            await _context.SaveChangesAsync(cancellationToken);

            return prestamista.Id;
        }

        public Task<int> ObtenerIdUsuarioLogueado(CancellationToken cancellationToken = default)
        {
            var claim = _httpContextAccessor.HttpContext?.User?.FindFirst("IdPrestamista");

            if (claim == null)
                throw new ArgumentException("No se pudo obtener el IdPrestamista del token.");

            if (!int.TryParse(claim.Value, out var id) || id <= 0)
                throw new ArgumentException("El IdPrestamista del token no es válido.");

            return Task.FromResult(id);
        }

        public async Task<bool> UpdatePerfilAsync(int id, PrestamistaUpdateDTO dto, CancellationToken cancellationToken = default)
        {
            if (id <= 0) throw new ArgumentException("ID inválido.");
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            var prestamista = await _context.Prestamistas.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
            if (prestamista == null) throw new ArgumentException("Prestamista no encontrado.");

            // GUARD: PROTECCIÓN CUENTA DEMO
            if (prestamista.Usuario.ToLower() == "demo")
            {
                if (!string.IsNullOrWhiteSpace(dto.NuevaContrasenia) || 
                    (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email != prestamista.Correo) ||
                    (!string.IsNullOrWhiteSpace(dto.Usuario) && dto.Usuario != prestamista.Usuario))
                {
                    throw new InvalidOperationException("No se permite modificar credenciales en la cuenta DEMO.");
                }
            }

            // Validar duplicados si quiere cambiar correo/usuario
            if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email != prestamista.Correo)
            {
                var existeEmail = await _context.Prestamistas
                    .AnyAsync(p => p.Correo == dto.Email && p.Id != id, cancellationToken);

                if (existeEmail) throw new ArgumentException("El correo ya está registrado.");
            }

            if (!string.IsNullOrWhiteSpace(dto.Usuario) && dto.Usuario != prestamista.Usuario)
            {
                var existeUsuario = await _context.Prestamistas
                    .AnyAsync(p => p.Usuario == dto.Usuario && p.Id != id, cancellationToken);

                if (existeUsuario) throw new ArgumentException("El usuario ya está registrado.");
            }

            if (!string.IsNullOrWhiteSpace(dto.Nombre)) prestamista.Nombre = dto.Nombre;
            if (!string.IsNullOrWhiteSpace(dto.Apellido)) prestamista.Apellido = dto.Apellido;
            if (!string.IsNullOrWhiteSpace(dto.Usuario)) prestamista.Usuario = dto.Usuario;
            if (!string.IsNullOrWhiteSpace(dto.Email)) prestamista.Correo = dto.Email;

            if (!string.IsNullOrWhiteSpace(dto.NuevaContrasenia))
            {
                if (string.IsNullOrWhiteSpace(dto.ContraseniaActual))
                    throw new ArgumentException("Debe ingresar la contraseña actual para cambiarla.");

                if (!PasswordHasher.Verify(dto.ContraseniaActual, prestamista.ContraseniaHash))
                    throw new ArgumentException("La contraseña actual es incorrecta.");

                prestamista.ContraseniaHash = PasswordHasher.Hash(dto.NuevaContrasenia);
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
