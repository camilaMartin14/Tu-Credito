using TuCredito.Models.EntidadesApisTerceros;
using TuCredito.Services.Interfaces.Clients;

namespace TuCredito.Services.Implementations.Clients;
    public class DolarService : IDolarService
    {
        private readonly HttpClient _httpClient;
        public DolarService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<DolarOficialModel?> GetDolarOficialAsync()
        {
            var response = await _httpClient.GetFromJsonAsync<DolarOficialModel>("https://dolarapi.com/v1/dolares/oficial");
            // Tambien podemos guardar la URL en una variable pero queria simplificarlo lo mas posible

            return response;
        }
    }
