using TuCredito.DTOs;
using TuCredito.Services.Interfaces;
using TuCredito.Services.Implementations.Clients;
using TuCredito.Models.Enums;

namespace TuCredito.Services.Implementations
{
    public class EvaluacionCrediticiaService : IEvaluacionCrediticiaService
    {
        private readonly BcraDeudoresService _bcraService;

        public EvaluacionCrediticiaService(BcraDeudoresService bcraService)
        {
            _bcraService = bcraService;
        }

        public async Task<EvaluacionCrediticiaResponseDTO> EvaluarRiesgoAsync(EvaluacionCrediticiaRequestDTO request)
        {
            // 1. Obtener Situación BCRA
            var deudaResponse = await _bcraService.GetDeudasByCuitAsync(request.Cuit);
            
            // Si no hay respuesta o no hay deudas, asumimos Situación 1 (Normal/Sin Deudas registradas)
            int maxSituacion = 1;
            if (deudaResponse != null && deudaResponse.Deudas != null && deudaResponse.Deudas.Any())
            {
                // Tomamos la peor situación registrada
                maxSituacion = deudaResponse.Deudas.Max(d => (int)d.Situacion);
            }

            // 2. Calcular Capacidad de Pago (si hay ingresos)
            bool capacidadPagoComprometida = false;
            if (request.IngresoMensual.HasValue && request.IngresoMensual.Value > 0)
            {
                var relacionCuotaIngreso = (request.CuotaEstimada / request.IngresoMensual.Value) * 100;
                if (relacionCuotaIngreso > 30)
                {
                    capacidadPagoComprometida = true;
                }
            }

            // 3. Matriz de Decisión
            var response = new EvaluacionCrediticiaResponseDTO
            {
                SituacionBcra = $"Situación {maxSituacion}"
            };

            // Lógica según lo definido
            if (maxSituacion == 1) // Normal
            {
                if (capacidadPagoComprometida)
                {
                    response.Estado = "RECHAZADO"; // O AJUSTAR
                    response.Motivo = "La cuota supera el 30% de los ingresos declarados.";
                    response.DetalleRiesgo = "Voluntad de pago ALTA, Capacidad de pago BAJA.";
                    
                    // Sugerencia: Calcular monto para que la cuota sea el 30%
                    if (request.IngresoMensual.HasValue)
                    {
                         // Regla de tres simple inversa aproximada (asumiendo proporcionalidad lineal para la sugerencia)
                         // CuotaActual -> MontoSolicitado
                         // CuotaObjetivo (30% Ingreso) -> X
                         var cuotaObjetivo = request.IngresoMensual.Value * 0.30m;
                         
                         // MontoSugerido = (MontoSolicitado * CuotaObjetivo) / CuotaActual
                         if (request.CuotaEstimada > 0)
                         {
                            response.MontoMaximoSugerido = Math.Round((request.MontoSolicitado * cuotaObjetivo) / request.CuotaEstimada, 2);
                         }
                    }
                }
                else
                {
                    response.Estado = "APROBADO";
                    response.Motivo = "Cumple con todos los requisitos de riesgo.";
                    response.DetalleRiesgo = "Riesgo Bajo.";
                }
            }
            else if (maxSituacion == 2) // Riesgo Bajo / Seguimiento Especial
            {
                if (capacidadPagoComprometida)
                {
                    response.Estado = "RECHAZADO";
                    response.Motivo = "Historial irregular y capacidad de pago insuficiente.";
                    response.DetalleRiesgo = "Riesgo Alto.";
                }
                else
                {
                    // Si no declara ingresos, Sit 2 es riesgoso -> RECHAZADO según matriz "Sin Ingresos"
                    if (!request.IngresoMensual.HasValue)
                    {
                        response.Estado = "RECHAZADO";
                        response.Motivo = "Historial irregular y falta de comprobación de ingresos.";
                        response.DetalleRiesgo = "Riesgo Medio-Alto (Sin Info Ingresos).";
                    }
                    else
                    {
                        response.Estado = "REVISION";
                        response.Motivo = "Requiere revisión manual por historial reciente.";
                        response.DetalleRiesgo = "Riesgo Medio.";
                    }
                }
            }
            else // Situación 3, 4, 5, 6 -> Rechazo Directo
            {
                response.Estado = "RECHAZADO";
                response.Motivo = "Situación crediticia en BCRA no apta.";
                response.DetalleRiesgo = $"Alto Riesgo de Insolvencia (Situación {maxSituacion}).";
            }

            return response;
        }
    }
}
