using TuCredito.Models.EntidadesApisTerceros;

namespace TuCredito.Services.Interfaces.Clients;
    public interface IBcraDeudoresService
    {
        Task<DeudaResponse> GetDeudasByCuitAsync(long cuit);
    }
