using TuCredito.Models;

namespace TuCredito.Services.Interfaces
{
    public interface IDolarService
    {
        Task<DolarOficialModel?> GetDolarOficialAsync();
    }
}
