using System.Text.Json.Serialization;

namespace TuCredito.Models.EntidadesApisTerceros;
public class DolarOficialModel
    {
        [JsonPropertyName("moneda")]
        public string Currency { get; set; } = string.Empty;

        [JsonPropertyName("casa")]
        public string House { get; set; } = string.Empty;

        [JsonPropertyName("nombre")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("compra")]
        public int Purchase { get; set; } 

        [JsonPropertyName("venta")]
        public int Sale { get; set; }
    }

