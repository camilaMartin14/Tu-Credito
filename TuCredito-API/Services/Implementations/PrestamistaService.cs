using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Repositories.Interfaces;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations
{
    public class PrestamistaService : IPrestamistaService
    {
        private readonly IPrestamistaRepository _repository;
        public PrestamistaService(IPrestamistaRepository repository)
        {
            _repository = repository;
        }

        public Task<Prestamista?> LoginAsync(string email, string contrasenia)
        {
            throw new NotImplementedException();
        }

        public Task<Prestamista?> ObtenerPrestamistaPorEmailAsync(string email)
        {
            throw new NotImplementedException();
        }

        public Task<Prestamista?> ObtenerPrestamistaPorIdAsync(int idPrestamista)
        {
            throw new NotImplementedException();
        }

        public Task<int> RegistrarPrestamistaAsync(PrestamistaRegisterDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
