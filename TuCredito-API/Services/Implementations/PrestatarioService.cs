using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Repositories.Interfaces;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations;
    public class PrestatarioService : IPrestatarioService
    {
        private readonly IPrestatarioRepository _repository;

        public PrestatarioService(IPrestatarioRepository repository)
        {
            _repository = repository;
        }

        public async Task<bool> ActualizarAsync(Prestatario prestatario)
        {
            if (prestatario.Dni <= 0)
                throw new ArgumentException("Id inválido.");

            return await _repository.ActualizarAsync(prestatario);
        }

        public async Task<bool> CambiarEstadoAsync(int dni, bool activo)
        {
            if (dni <= 0)
                throw new ArgumentException("Dni inválido.");

            return await _repository.CambiarEstadoAsync(dni, activo);
        }

        public async Task<int> CrearAsync(Prestatario prestatario)
        {
            if (string.IsNullOrWhiteSpace(prestatario.Nombre))
                throw new ArgumentException("El nombre es obligatorio.");

            if (prestatario.Dni <= 0)
                throw new ArgumentException("El DNI es inválido.");

            return await _repository.CrearAsync(prestatario);
        }

        public async Task<List<Prestatario>> ObtenerConFiltrosAsync(PrestatarioDTO filtro)
        {
            return await _repository.ObtenerConFiltrosAsync(filtro);
        }

        public async Task<Prestatario?> ObtenerPorDniAsync(int dni)
        {
            if (dni <= 0)
                throw new ArgumentException("Id inválido.");

            return await _repository.ObtenerPorDniAsync(dni);
        }
    }
