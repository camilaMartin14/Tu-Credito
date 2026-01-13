using Microsoft.AspNetCore.Identity;
using System.Linq.Expressions;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Repositories.Interfaces;
using TuCredito.Security;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations
{
    public class PrestamistaService : IPrestamistaService
    {
        private readonly IPrestamistaRepository _repository;
        private readonly IHttpContextAccessor _httpContext;
        public PrestamistaService(IPrestamistaRepository repository, IHttpContextAccessor httpContext)
        {
            _repository = repository;
            _httpContext = httpContext;
        }

        //Lo tengo que corregir, se inicia sesion con usuario
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
            var prestamista = await _repository.ObtenerPrestamistaPorEmail(email);
            if (prestamista == null) return null;

            return new Prestamista
            {
                Id = prestamista.Id,
                Nombre = prestamista.Nombre,
                Apellido = prestamista.Apellido,
                Correo = prestamista.Correo,
                EsActivo = prestamista.EsActivo,
                Usuario = prestamista.Usuario,
                ContraseniaHash = prestamista.ContraseniaHash
            };

        }

        public async Task<Prestamista?> ObtenerPrestamistaPorIdAsync(int idPrestamista)
        {
            var usuario = await _repository.ObtenerPrestamistaPorId(idPrestamista);
            if (usuario == null) return null;

            return new Prestamista
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Apellido = usuario.Apellido,
                Correo = usuario.Correo,
                EsActivo = usuario.EsActivo,
                Usuario = usuario.Usuario,
                ContraseniaHash = usuario.ContraseniaHash
            };
        }

        public async Task<int> RegistrarPrestamistaAsync(PrestamistaRegisterDto dto)
        {
            var existente = await _repository.ObtenerPrestamistaPorEmail(dto.Correo);
            if (existente != null)
                throw new Exception("El email ya está registrado");

            var prestamista = new Prestamista
            {
                Nombre = dto.Nombre,
                Apellido = dto.Apellido,
                Correo = dto.Correo,
                EsActivo = true,
                Usuario = dto.Usuario,
                ContraseniaHash = PasswordHasher.Hash(dto.Contrasenia)
            };

            return await _repository.RegistrarPrestamista(prestamista);
        }

        public async Task<int> ObtenerIdUsuarioLogueado() 
        { 
            var claim = _httpContext.HttpContext?.User?.FindFirst("IdPrestamista");
            
            if (claim == null) throw new ArgumentException("No se pudo obtener el IdPrestamista del token");
            return int.Parse(claim.Value); // ESTA TMB VA CUANDO SE DESCOMENTE EL DE PRUEBA
            //if (claim == null) { return 1; }// ID de prueba --- el correcto es la linea que quedo comentada arriba
            //else { return 2; }
            
               
        }

        
    }
}
