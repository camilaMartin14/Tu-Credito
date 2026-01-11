using TuCredito.Models;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations
{
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
            //GetFromJsonAsync<T> ya deserializa el JSON a un objeto del tipo T
            // Tambien podemos guardar la URL en una variable pero queria simplificarlo lo mas posible

            return response;
        }
    }
}
