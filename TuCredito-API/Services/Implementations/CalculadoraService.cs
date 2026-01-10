using TuCredito.Controllers;
using TuCredito.DTOs;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations
{
    public class CalculadoraService : ICalculadoraService
    {
        public SimulacionPrestamoOutputDTO CalcularSimulacion(SimulacionPrestamoEntryDTO entry)
        {
            if (entry.MontoPrestamo <= 0)
                throw new ArgumentException("El monto del préstamo debe ser mayor a cero");

            if (entry.CantidadCuotas <= 0)
                throw new ArgumentException("La cantidad de cuotas debe ser mayor a cero");

            if (entry.InteresMensual < 0)
                throw new ArgumentException("El interés no puede ser negativo");

            // Interés simple fijo:
            // Total = Capital + (Capital * interés * cuotas)
            var interesTotal = entry.MontoPrestamo * entry.InteresMensual * entry.CantidadCuotas;
            var totalAPagar = entry.MontoPrestamo + interesTotal;

            // Cálculo de cuota
            var montoCuota = Math.Round(
                totalAPagar / entry.CantidadCuotas,
                0, //Redondeo para que no queden centavos y todos los precios a pagar sean .00
                MidpointRounding.AwayFromZero);

            totalAPagar = montoCuota * entry.CantidadCuotas; 

            var resultado = new SimulacionPrestamoOutputDTO
            {
                MontoCuota = montoCuota,
                TotalAPagar = totalAPagar
            };

            for (int i = 1; i <= entry.CantidadCuotas; i++)
            {
                resultado.DetalleCuotas.Add(new CuotaSimuladaDTO
                {
                    NumeroCuota = i,
                    Monto = montoCuota,
                    FechaVencimiento = entry.FechaInicio?.AddMonths(i)
                });
            }

            return resultado;
        }

       
    }
}
