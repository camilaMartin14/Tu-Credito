using Microsoft.EntityFrameworkCore;
using TuCredito.DTOs.Dashboard;
using TuCredito.Models;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations;
    public class DashboardService : IDashboardService
    {
        private readonly TuCreditoContext _context;

        public DashboardService(TuCreditoContext context)
        {
            _context = context;
        }

        public async Task<DashboardKpisDTO> GetKpisAsync(DateTime? from = null, DateTime? to = null)
        {
            var now = DateTime.Now;
            
            bool hasFilter = from.HasValue || to.HasValue;
            var startDate = from ?? DateTime.MinValue;
            var endDate = to ?? DateTime.MaxValue;

            IQueryable<Prestamo> prestamosQuery = _context.Prestamos;
            if (hasFilter)
            {
                prestamosQuery = prestamosQuery.Where(p => p.FechaOtorgamiento >= startDate && p.FechaOtorgamiento <= endDate);
            }
            var totalPrestado = await prestamosQuery.SumAsync(p => p.MontoOtorgado);

            var capitalPendiente = await _context.Cuotas
                .Include(c => c.IdEstadoNavigation)
                .Where(c => c.IdEstadoNavigation.Descripcion == "Pendiente"
                         || c.IdEstadoNavigation.Descripcion == "Vencida")
                .SumAsync(c => c.Monto - (c.Interes ?? 0));

            IQueryable<Pago> pagosQuery = _context.Pagos;
            if (hasFilter)
            {
                pagosQuery = pagosQuery.Where(p => p.FecPago >= startDate && p.FecPago <= endDate);
            }
            else
            {
                pagosQuery = pagosQuery.Where(p => p.FecPago.Month == now.Month && p.FecPago.Year == now.Year);
            }
            var totalCobrado = await pagosQuery.SumAsync(p => p.Monto);

            var pagosConCuota = await pagosQuery
                .Join(_context.Cuotas,
                      p => p.IdCuota,
                      c => c.IdCuota,
                      (p, c) => new { PagoMonto = p.Monto, CuotaMonto = c.Monto, CuotaInteres = c.Interes ?? 0 })
                .ToListAsync();

            decimal totalInteresCobrado = 0;
            foreach (var item in pagosConCuota)
            {
                if (item.CuotaMonto > 0)
                {
                    var ratio = item.CuotaInteres / item.CuotaMonto;
                    totalInteresCobrado += item.PagoMonto * ratio;
                }
            }

            var totalEnMora = await _context.Cuotas
                .Include(c => c.IdEstadoNavigation)
                .Where(c => c.IdEstadoNavigation.Descripcion == "Vencida")
                .SumAsync(c => c.Monto);

            decimal porcentajeMorosidad = 0;
            if (capitalPendiente > 0)
                porcentajeMorosidad = (totalEnMora / capitalPendiente) * 100;

            decimal rentabilidad = 0;
            if (totalPrestado > 0)
                rentabilidad = (totalInteresCobrado / totalPrestado) * 100;

            return new DashboardKpisDTO
            {
                TotalPrestadoHistorico = totalPrestado,
                CapitalPendiente = capitalPendiente,
                TotalCobrado = totalCobrado,
                TotalInteresCobrado = totalInteresCobrado,
                TotalEnMora = totalEnMora,
                PorcentajeMorosidad = Math.Round(porcentajeMorosidad, 2),
                Rentabilidad = Math.Round(rentabilidad, 2)
            };
        }

        public async Task<List<GraficoDatoDTO>> GetProyeccionFlujoCajaAsync()
        {
            var today = DateTime.Today;
            var endDate = today.AddDays(28);

            var cuotas = await _context.Cuotas
                .Include(c => c.IdEstadoNavigation)
                .Where(c => c.IdEstadoNavigation.Descripcion == "Pendiente"
                        && c.FecVto >= today && c.FecVto <= endDate)
                .Select(c => new { c.FecVto, c.Monto })
                .ToListAsync();

            var result = new List<GraficoDatoDTO>();
            for (int i = 0; i < 4; i++)
            {
                var startWeek = today.AddDays(i * 7);
                var endWeek = startWeek.AddDays(6);
                var sum = cuotas.Where(c => c.FecVto >= startWeek && c.FecVto <= endWeek).Sum(c => c.Monto);
                
                result.Add(new GraficoDatoDTO 
                { 
                    Etiqueta = $"Semana {i + 1}", 
                    Valor = sum 
                });
            }
            return result;
        }

        public async Task<List<SerieTiempoDTO>> GetEvolucionColocacionAsync(DateTime? from = null, DateTime? to = null)
        {
             var query = _context.Prestamos.AsQueryable();

            if (from.HasValue)
                query = query.Where(p => p.FechaOtorgamiento >= from.Value);
            
            if (to.HasValue)
                query = query.Where(p => p.FechaOtorgamiento <= to.Value);

            return await query
                .GroupBy(p => new { p.FechaOtorgamiento.Year, p.FechaOtorgamiento.Month })
                .Select(g => new SerieTiempoDTO
                {
                    Anio = g.Key.Year,
                    Mes = g.Key.Month,
                    Valor = g.Sum(p => p.MontoOtorgado)
                })
                .OrderBy(x => x.Anio)
                .ThenBy(x => x.Mes)
                .ToListAsync();
        }

        public async Task<List<GraficoDatoDTO>> GetComposicionRiesgoAsync()
        {
            var today = DateTime.Today;
            var vencidas = await _context.Cuotas
                .Include(c => c.IdEstadoNavigation)
                .Where(c => c.IdEstadoNavigation.Descripcion == "Vencida")
                .Select(c => new { c.FecVto, c.Monto })
                .ToListAsync();

            return new List<GraficoDatoDTO>
            {
                new GraficoDatoDTO { Etiqueta = "1-30 Días", Valor = vencidas.Where(c => (today - c.FecVto).Days <= 30).Sum(c => c.Monto) },
                new GraficoDatoDTO { Etiqueta = "31-60 Días", Valor = vencidas.Where(c => (today - c.FecVto).Days > 30 && (today - c.FecVto).Days <= 60).Sum(c => c.Monto) },
                new GraficoDatoDTO { Etiqueta = "61-90 Días", Valor = vencidas.Where(c => (today - c.FecVto).Days > 60 && (today - c.FecVto).Days <= 90).Sum(c => c.Monto) },
                new GraficoDatoDTO { Etiqueta = "+90 Días", Valor = vencidas.Where(c => (today - c.FecVto).Days > 90).Sum(c => c.Monto) }
            };
        }

        public async Task<List<GraficoDatoDTO>> GetPrestamosPorEstadoAsync()
        {
            return await _context.Prestamos
                .Include(p => p.IdEstadoNavigation)
                .GroupBy(p => p.IdEstadoNavigation.Descripcion)
                .Select(g => new GraficoDatoDTO
                {
                    Etiqueta = g.Key,
                    Valor = g.Count()
                })
                .ToListAsync();
        }

        public async Task<List<SerieTiempoDTO>> GetFlujoCobranzasAsync(DateTime? from = null, DateTime? to = null)
        {
            var query = _context.Pagos.AsQueryable();

            if (from.HasValue)
                query = query.Where(p => p.FecPago >= from.Value);
            
            if (to.HasValue)
                query = query.Where(p => p.FecPago <= to.Value);

            return await query
                .GroupBy(p => new { p.FecPago.Year, p.FecPago.Month })
                .Select(g => new SerieTiempoDTO
                {
                    Anio = g.Key.Year,
                    Mes = g.Key.Month,
                    Valor = g.Sum(p => p.Monto)
                })
                .OrderBy(x => x.Anio)
                .ThenBy(x => x.Mes)
                .ToListAsync();
        }

        public async Task<List<MorosidadDetalleDTO>> GetMorosidadDetalladaAsync()
        {
            var query =
                from c in _context.Cuotas
                join p in _context.Prestamos on c.IdPrestamo equals p.IdPrestamo
                join cl in _context.Prestatarios on p.DniPrestatario equals cl.Dni
                join ec in _context.EstadosCuotas on c.IdEstado equals ec.IdEstado
                where ec.Descripcion == "Vencida"
                select new MorosidadDetalleDTO
                {
                    Cliente = cl.Nombre + " " + cl.Apellido,
                    FechaVencimiento = c.FecVto,
                    DiasAtraso = (DateTime.Now - c.FecVto).Days,
                    MontoAdeudado = c.Monto
                };

            return await query.ToListAsync();
        }

        public async Task<List<CuotaVencerDTO>> GetCuotasAVencerAsync()
        {
            var today = DateTime.Today;
            var limitDate = today.AddDays(15);

            var query =
                from c in _context.Cuotas
                join p in _context.Prestamos on c.IdPrestamo equals p.IdPrestamo
                join cl in _context.Prestatarios on p.DniPrestatario equals cl.Dni
                join ec in _context.EstadosCuotas on c.IdEstado equals ec.IdEstado
                where ec.Descripcion == "Pendiente"
                      && c.FecVto >= today
                      && c.FecVto <= limitDate
                select new CuotaVencerDTO
                {
                    Cliente = cl.Nombre + " " + cl.Apellido,
                    FechaVencimiento = c.FecVto,
                    Monto = c.Monto,
                    DiasParaVencer = (c.FecVto - today).Days
                };

            return await query.OrderBy(x => x.FechaVencimiento).ToListAsync();
        }

        public async Task<List<GraficoDatoDTO>> GetRankingClientesDeudaAsync()
        {
            return await _context.Cuotas
                .Include(c => c.IdEstadoNavigation)
                .Include(c => c.IdPrestamoNavigation)
                    .ThenInclude(p => p.DniPrestatarioNavigation)
                .Include(c => c.IdPrestamoNavigation.IdEstadoNavigation)
                .Where(c => c.IdPrestamoNavigation.IdEstadoNavigation.Descripcion == "Activo"
                         && (c.IdEstadoNavigation.Descripcion == "Pendiente"
                          || c.IdEstadoNavigation.Descripcion == "Vencida"))
                .GroupBy(c => new
                {
                    c.IdPrestamoNavigation.DniPrestatarioNavigation.Nombre,
                    c.IdPrestamoNavigation.DniPrestatarioNavigation.Apellido
                })
                .Select(g => new GraficoDatoDTO
                {
                    Etiqueta = g.Key.Nombre + " " + g.Key.Apellido,
                    Valor = g.Sum(c => c.Monto - (c.Interes ?? 0))
                })
                .OrderByDescending(x => x.Valor)
                .Take(10)
                .ToListAsync();
        }

        public async Task<AnalistaTasaDTO> GetAnalisisTasasAsync()
        {
            var prestamos = await _context.Prestamos.ToListAsync();

            if (!prestamos.Any())
                return new AnalistaTasaDTO();

            var promedio = prestamos.Average(p => p.TasaInteres);

            return new AnalistaTasaDTO
            {
                TasaPromedioGlobal = Math.Round(promedio, 2),
                DistribucionPorRango = new List<GraficoDatoDTO>
                {
                    new GraficoDatoDTO { Etiqueta = "< 20%", Valor = prestamos.Count(p => p.TasaInteres < 20) },
                    new GraficoDatoDTO { Etiqueta = "20% - 30%", Valor = prestamos.Count(p => p.TasaInteres >= 20 && p.TasaInteres <= 30) },
                    new GraficoDatoDTO { Etiqueta = "> 30%", Valor = prestamos.Count(p => p.TasaInteres > 30) }
                }
            };
        }

        public async Task<List<SerieTiempoDTO>> GetEvolucionSaldoAsync()
        {
            var loans = await _context.Prestamos
                .Select(p => new { p.FechaOtorgamiento.Year, p.FechaOtorgamiento.Month, Monto = p.MontoOtorgado })
                .ToListAsync();

            var payments = await _context.Pagos
                .Select(p => new { p.FecPago.Year, p.FecPago.Month, Monto = -p.Monto })
                .ToListAsync();

            var eventos = loans.Concat(payments)
                .GroupBy(e => new { e.Year, e.Month })
                .OrderBy(g => g.Key.Year)
                .ThenBy(g => g.Key.Month);

            decimal saldo = 0;
            var result = new List<SerieTiempoDTO>();

            foreach (var g in eventos)
            {
                saldo += g.Sum(x => x.Monto);
                result.Add(new SerieTiempoDTO
                {
                    Anio = g.Key.Year,
                    Mes = g.Key.Month,
                    Valor = saldo
                });
            }

            return result;
        }
    }