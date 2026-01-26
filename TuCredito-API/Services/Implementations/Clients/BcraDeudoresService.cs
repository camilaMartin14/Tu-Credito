using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using TuCredito.Models.EntidadesApisTerceros;
using TuCredito.Models.Enums;
using TuCredito.Services.Interfaces.Clients;

namespace TuCredito.Services.Implementations.Clients;
    public class BcraDeudoresService : IBcraDeudoresService
    {
        private readonly HttpClient _httpClient;

        public BcraDeudoresService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<DeudaResponse> GetDeudasByCuitAsync(long cuit)
        {
            var requestUrl = $"Deudas/{cuit}";

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

                var resultado = new DeudaResponse
                {
                    Cuit = bcraResponse.Results.Identificacion,
                    Deudas = bcraResponse.Results.Periodos?
                        .SelectMany(p => p.Entidades)
                        .Select(e => new EntidadDeuda
                        {
                            Entidad = e.Entidad,
                            Situacion = Enum.IsDefined(typeof(SituacionCrediticia), e.Situacion)
                                        ? (SituacionCrediticia)e.Situacion
                                        : SituacionCrediticia.Desconocido, 
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
