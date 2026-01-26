using TuCredito.Models;

namespace TuCredito.Repositories.Interfaces;
    public interface IPrestamistaRepository
    {
        Task<int> RegistrarPrestamista(Prestamista p);
        Task<Prestamista?> ObtenerPrestamistaPorId(int idPrestamista);
        Task<Prestamista?> ObtenerPrestamistaPorEmail(string email);
        Task<Prestamista?> ObtenerPrestamistaPorUsuario(string usuario);
        Task<bool> UpdatePrestamista(Prestamista prestamista);

    }
