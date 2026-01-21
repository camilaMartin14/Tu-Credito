using TuCredito.Controllers;
using TuCredito.DTOs;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations;
    public class CalculadoraService : ICalculadoraService
    {

        public SimulacionPrestamoOutputDTO CalcularSimulacion(SimulacionPrestamoEntryDTO entry)
        {
            ValidarEntry(entry);

            var interesTotal = CalcularInteresTotal(entry);

            var totalAPagar = entry.MontoPrestamo + interesTotal;

            var montoCuota = CalcularMontoCuota(totalAPagar, entry.CantidadCuotas);

            totalAPagar = montoCuota * entry.CantidadCuotas;

            var resultado = new SimulacionPrestamoOutputDTO
            {
                MontoCuota = montoCuota,
                TotalAPagar = totalAPagar
            };

            GenerarDetalleCuotas(resultado, entry, montoCuota);

            return resultado;
        }

        public decimal CalcularInteresMoratorio(decimal montoCuotaOriginal, DateTime fechaVencimiento, DateTime fechaPago)
        {
            if (fechaPago <= fechaVencimiento) return 0;

            var diasAtraso = (fechaPago - fechaVencimiento).Days;
            
            // 1% diario (0.01) sobre el monto original de la cuota
            var interes = montoCuotaOriginal * 0.01m * diasAtraso;

            return Math.Round(interes, 2);
        }

        /// Valida los datos de entrada de la simulación.
        private void ValidarEntry(SimulacionPrestamoEntryDTO entry)
        {
            if (entry.MontoPrestamo <= 0)
                throw new ArgumentException("El monto del préstamo debe ser mayor a cero");

            if (entry.CantidadCuotas <= 0)
                throw new ArgumentException("La cantidad de cuotas debe ser mayor a cero");

            if (entry.InteresMensual < 0)
                throw new ArgumentException("El interés no puede ser negativo");
        }

        /// Capital * interés mensual * cantidad de cuotas
        private decimal CalcularInteresTotal(SimulacionPrestamoEntryDTO entry)
        {
            // CORRECCION: Se divide por 100 para interpretar el interés como porcentaje
            return entry.MontoPrestamo
                   * (entry.InteresMensual / 100)
                   * entry.CantidadCuotas;
        }

        private decimal CalcularMontoCuota(decimal totalAPagar, int cantidadCuotas) //Ya redondeado
        {
            return Math.Round(
                totalAPagar / cantidadCuotas,
                0,
                MidpointRounding.AwayFromZero);
        }

        /// Cuota completa y su respectivo capital e interés.
        private void GenerarDetalleCuotas(
            SimulacionPrestamoOutputDTO resultado,
            SimulacionPrestamoEntryDTO entry,
            decimal montoCuota)
        {
            var capitalPorCuota = entry.MontoPrestamo / entry.CantidadCuotas;
            var interesPorCuota = entry.MontoPrestamo * entry.InteresMensual;

            for (int i = 1; i <= entry.CantidadCuotas; i++)
            {
                resultado.DetalleCuotas.Add(new CuotaSimuladaDTO
                {
                    NumeroCuota = i,
                    Monto = montoCuota,
                    Capital = Math.Round(capitalPorCuota, 0, MidpointRounding.AwayFromZero),
                    Interes = Math.Round(interesPorCuota, 0, MidpointRounding.AwayFromZero),
                    FechaVencimiento = entry.FechaInicio?.AddMonths(i)
                });
            }
        }
    }
