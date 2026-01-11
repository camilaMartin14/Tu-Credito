using TuCredito.Controllers;

namespace TuCredito.Services.Interfaces
{
    public interface ICalculadoraService
    {
        SimulacionPrestamoOutputDTO CalcularSimulacion(SimulacionPrestamoEntryDTO entry);
        decimal CalcularInteresMoratorio(decimal montoCuotaOriginal, DateTime fechaVencimiento, DateTime fechaPago);
    }
}
