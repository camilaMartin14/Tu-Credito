using Microsoft.AspNetCore.Identity;
using AutoMapper;
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
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMapper _mapper;

        public PrestamistaService(IPrestamistaRepository repository, IHttpContextAccessor httpContextAccessor, IMapper mapper)
        {
            _repository = repository;
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;
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
            return await _repository.ObtenerPrestamistaPorEmail(email);
        }

        public async Task<Prestamista?> ObtenerPrestamistaPorIdAsync(int idPrestamista)
        {
            return await _repository.ObtenerPrestamistaPorId(idPrestamista);
        }

        public async Task<int> RegistrarPrestamistaAsync(PrestamistaRegisterDto dto)
        {
            var existente = await _repository.ObtenerPrestamistaPorEmail(dto.Correo);
            if (existente != null)
                throw new Exception("El email ya está registrado");

            var prestamista = _mapper.Map<Prestamista>(dto);
            prestamista.ContraseniaHash = PasswordHasher.Hash(dto.Contrasenia);

            return await _repository.RegistrarPrestamista(prestamista);
        }

        public async Task<int> ObtenerIdUsuarioLogueado() 
        { 
            var claim = _httpContextAccessor.HttpContext?.User?.FindFirst("IdPrestamista");
            
            if (claim == null) throw new ArgumentException("No se pudo obtener el IdPrestamista del token");
            return int.Parse(claim.Value); // ESTA TMB VA CUANDO SE DESCOMENTE EL DE PRUEBA
            //if (claim == null) { return 1; }// ID de prueba --- el correcto es la linea que quedo comentada arriba
            //else { return 2; }
            
               
        }

        
    }
}
