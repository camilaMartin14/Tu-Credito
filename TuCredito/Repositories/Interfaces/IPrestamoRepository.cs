using TuCredito.Models;
using TuCredito.DTOs;

namespace TuCredito.Repositories.Interfaces
{
    public interface IPrestamoRepository
    {
        Task<bool> SoftDelete(int id);
        Task<bool> PostPrestamo(PrestamoDTO NvoPrestamo);
        Task<PrestamoDTO> GetPrestamoById(int id); // se me ocurre que es medio dificil que
                                                //conozca el id antes de buscarlo. Mas facil
                                                //seria con nombre - con filtro 
        Task<List<PrestamoDTO>> GetAllPrestamo();
        Task<List<PrestamoDTO>> GetPrestamoConFiltro(string filtro);
    }
}
