using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using TuCredito.Models.EntidadesApisTerceros;
using TuCredito.Models.Enums;
using Microsoft.Extensions.Configuration;

namespace TuCredito.Services.Implementations.Clients
{
    public class BcraDeudoresService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public BcraDeudoresService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<DeudaResponse> GetDeudasByCuitAsync(long cuit)
        {
            var baseUrl = _configuration["BcraApi:BaseUrl"];
            if (string.IsNullOrEmpty(baseUrl))
            {
                throw new InvalidOperationException("La URL base de la API del BCRA no está configurada.");
            }

            // Asumiendo que el endpoint es /Deudas/{cuit} 
            var requestUrl = $"{baseUrl}Deudas/{cuit}";

            try
            {
                var response = await _httpClient.GetAsync(requestUrl);

                if (!response.IsSuccessStatusCode)
                {
                    if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        return null;
                    }
                    response.EnsureSuccessStatusCode();
                }

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    Converters = { new JsonStringEnumConverter() } 
                };

                var bcraResponse = await response.Content.ReadFromJsonAsync<BcraApiResponse>(options);
                
                if (bcraResponse == null || bcraResponse.Results == null) return null;

                // Mapeo manual de la respuesta del BCRA a nuestro modelo interno DeudaResponse
                var resultado = new DeudaResponse
                {
                    Cuit = bcraResponse.Results.Identificacion,
                    Deudas = bcraResponse.Results.Periodos?
                        .SelectMany(p => p.Entidades)
                        .Select(e => new EntidadDeuda
                        {
                            Entidad = e.Entidad,
                            Situacion = (SituacionCrediticia)e.Situacion, 
                            Monto = e.Monto,
                            DiasAtraso = e.DiasAtrasoPago
                        }).ToList() ?? new List<EntidadDeuda>()
                };

                return resultado;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al consultar la API del BCRA: {ex.Message}", ex);
            }
        }
    }
}
