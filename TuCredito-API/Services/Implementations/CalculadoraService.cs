using TuCredito.Controllers;
using TuCredito.DTOs;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations;

public class CalculadoraService : ICalculadoraService
{
    public SimulacionPrestamoOutputDTO CalcularSimulacion(SimulacionPrestamoEntryDTO entry)
    {
        ValidarEntry(entry);

        switch (entry.IdSistAmortizacion)
        {
            case 2: return CalcularFrances(entry);
            case 3: return CalcularAleman(entry);
            case 4: return CalcularAmericano(entry);
            default: return CalcularDirecto(entry);
        }
    }

    public decimal CalcularInteresMoratorio(decimal montoCuotaOriginal, DateTime fechaVencimiento, DateTime fechaPago)
    {
        if (fechaPago <= fechaVencimiento) return 0;
        var diasAtraso = (fechaPago - fechaVencimiento).Days;
        var interes = montoCuotaOriginal * 0.01m * diasAtraso;
        return Math.Round(interes, 2);
    }

    private void ValidarEntry(SimulacionPrestamoEntryDTO entry)
    {
        if (entry.MontoPrestamo <= 0) throw new ArgumentException("El monto del préstamo debe ser mayor a cero");
        if (entry.CantidadCuotas <= 0) throw new ArgumentException("La cantidad de cuotas debe ser mayor a cero");
        if (entry.InteresMensual < 0) throw new ArgumentException("El interés no puede ser negativo");
    }

    private SimulacionPrestamoOutputDTO CalcularDirecto(SimulacionPrestamoEntryDTO entry)
    {
        var interesTotal = entry.MontoPrestamo * (entry.InteresMensual / 100) * entry.CantidadCuotas;
        var totalAPagar = entry.MontoPrestamo + interesTotal;
        var montoCuota = Math.Round(totalAPagar / entry.CantidadCuotas, 0, MidpointRounding.AwayFromZero);
        totalAPagar = montoCuota * entry.CantidadCuotas;

        var resultado = new SimulacionPrestamoOutputDTO
        {
            MontoCuota = montoCuota,
            TotalAPagar = totalAPagar
        };

        var capitalPorCuota = entry.MontoPrestamo / entry.CantidadCuotas;
        var interesPorCuota = entry.MontoPrestamo * (entry.InteresMensual / 100);
        var saldoRestante = entry.MontoPrestamo;

        for (int i = 1; i <= entry.CantidadCuotas; i++)
        {
            var capitalRound = Math.Round(capitalPorCuota, 0, MidpointRounding.AwayFromZero);
            saldoRestante -= capitalRound;

            resultado.DetalleCuotas.Add(new CuotaSimuladaDTO
            {
                NumeroCuota = i,
                Monto = montoCuota,
                Capital = capitalRound,
                Interes = Math.Round(interesPorCuota, 0, MidpointRounding.AwayFromZero),
                SaldoRestante = saldoRestante > 0 ? saldoRestante : 0,
                FechaVencimiento = entry.FechaInicio?.AddMonths(i)
            });
        }
        return resultado;
    }

    private SimulacionPrestamoOutputDTO CalcularFrances(SimulacionPrestamoEntryDTO entry)
    {
        var i = (double)(entry.InteresMensual / 100);
        var n = entry.CantidadCuotas;
        var P = (double)entry.MontoPrestamo;

        decimal cuota;
        if (i == 0)
        {
             cuota = Math.Round(entry.MontoPrestamo / n, 0, MidpointRounding.AwayFromZero);
        }
        else
        {
             var factor = Math.Pow(1 + i, n);
             var cuotaDouble = P * (i * factor) / (factor - 1);
             cuota = Math.Round((decimal)cuotaDouble, 0, MidpointRounding.AwayFromZero);
        }

        var resultado = new SimulacionPrestamoOutputDTO
        {
            MontoCuota = cuota,
            TotalAPagar = cuota * n
        };

        var saldo = entry.MontoPrestamo;
        for (int k = 1; k <= n; k++)
        {
            var interes = Math.Round(saldo * (entry.InteresMensual / 100), 0, MidpointRounding.AwayFromZero);
            var capital = cuota - interes;
            
            if (k == n)
            {
                capital = saldo;
                cuota = capital + interes; 
            }

            saldo -= capital;

            resultado.DetalleCuotas.Add(new CuotaSimuladaDTO
            {
                NumeroCuota = k,
                Monto = cuota,
                Capital = capital,
                Interes = interes,
                SaldoRestante = saldo > 0 ? saldo : 0,
                FechaVencimiento = entry.FechaInicio?.AddMonths(k)
            });
        }
        
        resultado.TotalAPagar = resultado.DetalleCuotas.Sum(c => c.Monto);
        
        return resultado;
    }

    private SimulacionPrestamoOutputDTO CalcularAleman(SimulacionPrestamoEntryDTO entry)
    {
        var n = entry.CantidadCuotas;
        var amortizacionConstante = Math.Round(entry.MontoPrestamo / n, 0, MidpointRounding.AwayFromZero);
        var saldo = entry.MontoPrestamo;
        
        var resultado = new SimulacionPrestamoOutputDTO
        {
            MontoCuota = 0, 
            TotalAPagar = 0
        };

        for (int k = 1; k <= n; k++)
        {
            var interes = Math.Round(saldo * (entry.InteresMensual / 100), 0, MidpointRounding.AwayFromZero);
            var capital = amortizacionConstante;

            if (k == n)
            {
                capital = saldo; 
            }

            var cuota = capital + interes;
            saldo -= capital;
            
            resultado.TotalAPagar += cuota;

            resultado.DetalleCuotas.Add(new CuotaSimuladaDTO
            {
                NumeroCuota = k,
                Monto = cuota,
                Capital = capital,
                Interes = interes,
                SaldoRestante = saldo > 0 ? saldo : 0,
                FechaVencimiento = entry.FechaInicio?.AddMonths(k)
            });
        }
        
        // En alemán la cuota varía, mostramos la primera para referencia inicial
        resultado.MontoCuota = resultado.DetalleCuotas.First().Monto;

        return resultado;
    }

    private SimulacionPrestamoOutputDTO CalcularAmericano(SimulacionPrestamoEntryDTO entry)
    {
        var n = entry.CantidadCuotas;
        var interesConstante = Math.Round(entry.MontoPrestamo * (entry.InteresMensual / 100), 0, MidpointRounding.AwayFromZero);
        var saldo = entry.MontoPrestamo;

        var resultado = new SimulacionPrestamoOutputDTO
        {
            MontoCuota = interesConstante,
            TotalAPagar = 0 
        };

        for (int k = 1; k <= n; k++)
        {
            var interes = interesConstante;
            decimal capital = 0;
            decimal cuota = interes;

            if (k == n)
            {
                capital = entry.MontoPrestamo;
                cuota = capital + interes;
            }

            saldo -= capital;
            resultado.TotalAPagar += cuota;

            resultado.DetalleCuotas.Add(new CuotaSimuladaDTO
            {
                NumeroCuota = k,
                Monto = cuota,
                Capital = capital,
                Interes = interes,
                SaldoRestante = saldo > 0 ? saldo : 0,
                FechaVencimiento = entry.FechaInicio?.AddMonths(k)
            });
        }

        return resultado;
    }
}
