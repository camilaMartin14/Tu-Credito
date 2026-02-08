using TuCredito.Models.EntidadesApisTerceros;

namespace TuCredito.Services.Interfaces.Clients;
    public interface IDolarService
    {
        Task<DolarOficialModel?> GetDolarOficialAsync();
    }
