using TuCredito.DTOs;
using TuCredito.Services.Interfaces;
using TuCredito.Services.Interfaces.Clients;
using TuCredito.Models.Enums;

namespace TuCredito.Services.Implementations;
    public class EvaluacionCrediticiaService : IEvaluacionCrediticiaService
    {
        private readonly IBcraDeudoresService _bcraService;

        public EvaluacionCrediticiaService(IBcraDeudoresService bcraService)
        {
            _bcraService = bcraService;
        }

        public async Task<EvaluacionCrediticiaResponseDTO> EvaluarRiesgoAsync(EvaluacionCrediticiaRequestDTO request)
        {
            int maxSituacion = 1;
            bool errorBcra = false;
            try 
            {
                var deudaResponse = await _bcraService.GetDeudasByCuitAsync(request.Cuit);
                if (deudaResponse != null && deudaResponse.Deudas != null && deudaResponse.Deudas.Any())
                {
                    maxSituacion = deudaResponse.Deudas.Max(d => (int)d.Situacion);
                }
            }
            catch 
            {
                maxSituacion = 2; 
                errorBcra = true;
            }

            bool capacidadPagoComprometida = false;
            if (request.IngresoMensual.HasValue && request.IngresoMensual.Value > 0)
            {
                var relacionCuotaIngreso = (request.CuotaEstimada / request.IngresoMensual.Value) * 100;
                if (relacionCuotaIngreso > 30)
                {
                    capacidadPagoComprometida = true;
                }
            }

            var response = new EvaluacionCrediticiaResponseDTO
            {
                SituacionBcra = errorBcra ? "Desconocida (Error BCRA)" : $"Situación {maxSituacion}"
            };

            if (errorBcra)
            {
                response.Estado = "REVISION";
                response.Motivo = "No se pudo verificar historial crediticio (API BCRA no disponible).";
                response.DetalleRiesgo = "Requiere validación manual de antecedentes.";
            }
            else if (maxSituacion == 1)
            {
                if (capacidadPagoComprometida)
                {
                    response.Estado = "RECHAZADO"; 
                    response.Motivo = "La cuota supera el 30% de los ingresos declarados.";
                    response.DetalleRiesgo = "Voluntad de pago ALTA, Capacidad de pago BAJA.";
                    
                    if (request.IngresoMensual.HasValue)
                    {
                         var cuotaObjetivo = request.IngresoMensual.Value * 0.30m;
                         
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
            else if (maxSituacion == 2)
            {
                if (capacidadPagoComprometida)
                {
                    response.Estado = "RECHAZADO";
                    response.Motivo = "Historial irregular y capacidad de pago insuficiente.";
                    response.DetalleRiesgo = "Riesgo Alto.";
                }
                else
                {
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
