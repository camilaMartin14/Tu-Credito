using Microsoft.AspNetCore.Identity;
using AutoMapper;
using System.Linq.Expressions;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Repositories.Interfaces;
using TuCredito.Security;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations;
    public class PrestamistaService : IPrestamistaService
    {
        private readonly IPrestamistaRepository _repository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMapper _mapper;

        public PrestamistaService(IPrestamistaRepository repository, IHttpContextAccessor httpContextAccessor, IMapper mapper)
        {
            _repository = repository;
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;
        }

        public async Task<Prestamista?> LoginAsync(string usuario, string contrasenia)
        {
            var prestamista = await _repository.ObtenerPrestamistaPorUsuario(usuario);

            if (prestamista == null)
                return null;

            if (!PasswordHasher.Verify(contrasenia, prestamista.ContraseniaHash))
                return null;

            return prestamista;
        }


        public async Task<Prestamista?> ObtenerPrestamistaPorEmailAsync(string email)
        {
            return await _repository.ObtenerPrestamistaPorEmail(email);
        }

        public async Task<Prestamista?> ObtenerPrestamistaPorIdAsync(int idPrestamista)
        {
            return await _repository.ObtenerPrestamistaPorId(idPrestamista);
        }

        public async Task<int> RegistrarPrestamistaAsync(PrestamistaRegisterDto dto)
        {
            var existenteEmail = await _repository.ObtenerPrestamistaPorEmail(dto.Correo);
            if (existenteEmail != null)
                throw new Exception("El email ya está registrado");

            var existenteUsuario = await _repository.ObtenerPrestamistaPorUsuario(dto.Usuario);
            if (existenteUsuario != null)
                throw new Exception("El nombre de usuario ya está registrado");

            var prestamista = _mapper.Map<Prestamista>(dto);
            prestamista.ContraseniaHash = PasswordHasher.Hash(dto.Contrasenia);

            return await _repository.RegistrarPrestamista(prestamista);
        }

        public async Task<int> ObtenerIdUsuarioLogueado() 
        { 
            var claim = _httpContextAccessor.HttpContext?.User?.FindFirst("IdPrestamista");
            
            if (claim == null) throw new ArgumentException("No se pudo obtener el IdPrestamista del token");
            return int.Parse(claim.Value);
        }

        public async Task<bool> UpdatePerfilAsync(int id, PrestamistaUpdateDTO dto)
        {
            var prestamista = await _repository.ObtenerPrestamistaPorId(id);
            if (prestamista == null) throw new ArgumentException("Prestamista no encontrado");

            if (!string.IsNullOrWhiteSpace(dto.Nombre)) prestamista.Nombre = dto.Nombre;
            if (!string.IsNullOrWhiteSpace(dto.Apellido)) prestamista.Apellido = dto.Apellido;
            if (!string.IsNullOrWhiteSpace(dto.Usuario)) prestamista.Usuario = dto.Usuario;
            if (!string.IsNullOrWhiteSpace(dto.Email)) prestamista.Correo = dto.Email;

            if (!string.IsNullOrWhiteSpace(dto.NuevaContrasenia))
            {
                if (!string.IsNullOrWhiteSpace(dto.ContraseniaActual))
                {
                    if (!PasswordHasher.Verify(dto.ContraseniaActual, prestamista.ContraseniaHash))
                        throw new ArgumentException("La contraseña actual es incorrecta");
                }
                
                prestamista.ContraseniaHash = PasswordHasher.Hash(dto.NuevaContrasenia);
            }

            return await _repository.UpdatePrestamista(prestamista);
        }
    }
