using TuCredito.DTOs;

namespace TuCredito.Services.Interfaces
{
    public interface IEvaluacionCrediticiaService
    {
        Task<EvaluacionCrediticiaResponseDTO> EvaluarRiesgoAsync(EvaluacionCrediticiaRequestDTO request);
    }
}
