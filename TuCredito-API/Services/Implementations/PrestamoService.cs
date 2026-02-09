using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TuCredito.Controllers;
using TuCredito.DTOs;
using TuCredito.Models;

using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations
{
    public class PrestamoService : IPrestamoService
    {
        private readonly TuCreditoContext _context;        
        private readonly ICalculadoraService _calculadora;
        private readonly IMapper _mapper;
        private readonly DbSet<Prestamo> _prestamo;
        private readonly IPrestamistaService _prestamista;




        public PrestamoService(
            TuCreditoContext context,
            IMapper mapper,
            ICalculadoraService calculadora,
            IPrestamistaService prestamista)  
        {
            _context = context;
            _mapper = mapper;
            _calculadora = calculadora;
            _prestamo = context.Set<Prestamo>();
            _prestamista = prestamista;

        }

        public async Task<List<PrestamoDTO>> GetAll()
        {
            var Lista = await _context.Prestamos.ToListAsync();
            return _mapper.Map<List<PrestamoDTO>>(Lista);
        }

        public async Task<PrestamoDTO> GetPrestamoById(int id)
        {
            if (id <= 0) throw new ArgumentException("ID inválido");

            var prestamo = await _context.Prestamos.FindAsync(id);
            if (prestamo == null) throw new Exception("Préstamo no encontrado");

            return _mapper.Map<PrestamoDTO>(prestamo);
        }

        public async Task<List<PrestamoDTO>> GetPrestamoConFiltro(string? nombre, int? estado, int? mesVto, int? anio)
        {
            if (mesVto.HasValue && (mesVto.Value > 12 || mesVto.Value < 1))
                throw new ArgumentException("El mes debe estar contenido entre 1 y 12");

            if (estado.HasValue && estado.Value == 2 && mesVto.HasValue && anio.HasValue)
            {
                var fechaFiltro = new DateTime(anio.Value, mesVto.Value, 1);
                if (fechaFiltro > DateTime.Today)
                    throw new ArgumentException("Solo se pueden consultar cuotas posteriores para préstamos activos");
            }

            var query = _context.Prestamos
                .Include(p => p.DniPrestatarioNavigation)
                .Include(p => p.Cuota)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(nombre))
            {
                query = query.Where(p => 
                    p.DniPrestatarioNavigation.Nombre.Contains(nombre) || 
                    p.DniPrestatarioNavigation.Apellido.Contains(nombre) ||
                    p.DniPrestatario.ToString().Contains(nombre));
            }

            if (estado.HasValue)
                query = query.Where(p => p.IdEstado == estado.Value);

            if (mesVto.HasValue && anio.HasValue)
            {
                query = query.Where(p => p.Cuota.Any(c =>
                    c.FecVto.Month == mesVto.Value &&
                    c.FecVto.Year == anio.Value));
            }

            var resultado = await query.ToListAsync();
            return _mapper.Map<List<PrestamoDTO>>(resultado);
        }
        

        public async Task<bool> PostPrestamo(PrestamoDTO nvoPrestamo)
        {
            if (nvoPrestamo.MontoOtorgado <= 0)
                throw new ArgumentException("El monto debe ser mayor que cero");

            if (string.IsNullOrWhiteSpace(nvoPrestamo.NombrePrestatario))
                throw new ArgumentException("Ingrese un nombre de prestatario");

            if (nvoPrestamo.CantidadCtas <= 0)
                throw new ArgumentException("Ingrese un número de cuotas válido");

            var existePrestatario = await _context.Prestatarios
                .AnyAsync(p => p.Dni == nvoPrestamo.DniPrestatario);

            if (!existePrestatario)
                throw new ArgumentException("El DNI ingresado no está registrado");

            var entidad = _mapper.Map<Prestamo>(nvoPrestamo);

            entidad.IdPrestamista = await _prestamista.ObtenerIdUsuarioLogueado();

            entidad.SaldoRestante = entidad.MontoOtorgado;

            entidad.FechaFinEstimada = entidad.FechaOtorgamiento.AddMonths(entidad.CantidadCtas);

            if (entidad.FechaOtorgamiento > DateTime.Now)
                throw new ArgumentException("La fecha de otorgamiento no puede ser futura");

            if (entidad.IdEstado != 1)
                throw new ArgumentException("El estado debe ser 'Activo'");

            if (entidad.FechaOtorgamiento < DateTime.Now.AddMonths(-24))
                throw new ArgumentException("La fecha de otorgamiento puede ser de hasta 24 meses anteriores");

            if (entidad.FechaOtorgamiento > entidad.Fec1erVto)
                throw new ArgumentException("La fecha del primer vencimiento debe ser posterior a la fecha de otorgamiento");

            if (entidad.IdPrestamista <= 0)
                throw new ArgumentException("No se pudo determinar el prestamista logueado");

            if (entidad.IdSistAmortizacion <= 0)
                throw new ArgumentException("Seleccione un sistema de amortización");

            if (entidad.TasaInteres <= 0)
                throw new ArgumentException("Ingrese una tasa de interés");

            entidad.Cuota ??= new List<Cuota>();

            GenerarCuotas(entidad);

            _context.Prestamos.Add(entidad);
            await _context.SaveChangesAsync();

            return true;
        }
        

        public async Task<bool> SoftDelete(int id)
        {
            if (id <= 0) throw new ArgumentException("ID inválido");

            var prestamo = await _context.Prestamos.FindAsync(id);
            if (prestamo == null) throw new ArgumentException("El préstamo indicado no existe");

            if (prestamo.IdEstado == 2) throw new ArgumentException("El préstamo ya se encuentra finalizado");
            if (prestamo.IdEstado == 3) throw new ArgumentException("El préstamo indicado está eliminado");

            if (await TienePagosPendientes(id)) throw new ArgumentException("No se pueden finalizar préstamos que aún tengan pagos pendientes");

            prestamo.IdEstado = 2;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> Delete(int id)
        {
            if (id <= 0) throw new ArgumentException("ID inválido");

            var prestamo = await _context.Prestamos.FindAsync(id);
            if (prestamo == null) throw new ArgumentException("El préstamo indicado no existe");

            if (prestamo.IdEstado == 3) throw new ArgumentException("El préstamo ya se encuentra eliminado");

            prestamo.IdEstado = 3;
            await _context.SaveChangesAsync();

            return true;
        }

        private async Task<bool> TienePagosPendientes(int idPrestamo)
        {
            return await _context.Cuotas
                .Where(c => c.IdPrestamo == idPrestamo)
                .AnyAsync(c =>
                    (_context.Pagos
                        .Where(p => p.IdCuota == c.IdCuota)
                        .Sum(p => (decimal?)p.Monto) ?? 0m) < c.Monto);
        }

        public void GenerarCuotas(Prestamo prestamo)
        {
            var simulacion = _calculadora.CalcularSimulacion(new SimulacionPrestamoEntryDTO
            {
                MontoPrestamo = prestamo.MontoOtorgado,
                CantidadCuotas = prestamo.CantidadCtas,
                InteresMensual = prestamo.TasaInteres,
                FechaInicio = prestamo.FechaOtorgamiento,
                IdSistAmortizacion = prestamo.IdSistAmortizacion
            });

            prestamo.Cuota ??= new List<Cuota>();

            foreach (var cuotaSimulada in simulacion.DetalleCuotas)
            {
                prestamo.Cuota.Add(new Cuota
                {
                    NroCuota = cuotaSimulada.NumeroCuota,
                    Monto = cuotaSimulada.Monto,
                    Interes = cuotaSimulada.Interes,
                    SaldoPendiente = cuotaSimulada.Monto,
                    IdEstado = 1, // 1 = Pendiente
                    FecVto = cuotaSimulada.FechaVencimiento
                        ?? throw new InvalidOperationException("Fecha de vencimiento no calculada")
                });
            }
        }


        public async Task<Prestamo> GetPrestamoEntityById(int id)
        {
            if (id <= 0) throw new ArgumentException("ID inválido");

            var prestamo = await _context.Prestamos.FindAsync(id);
            if (prestamo == null) throw new Exception("Préstamo no encontrado");

            return prestamo;
        }

        private int CalcularMesesActivo(DateTime inicio, DateTime fin)
        {
            return (fin.Year - inicio.Year) * 12 + fin.Month - inicio.Month + 1;
        }


        public async Task<ResumenPrestamoDTO> GetResumenPrestamo(int prestamoId)
        {
            if (prestamoId <= 0) throw new ArgumentException("ID inválido");

            var prestamo = await _context.Prestamos.FindAsync(prestamoId);
            if (prestamo == null) throw new Exception("Préstamo no encontrado");

            var cuotas = await _context.Cuotas
                .Where(c => c.IdPrestamo == prestamoId)
                .ToListAsync();

            var cuotasSaldadas = cuotas.Where(c => c.IdEstado == 2).ToList(); // 2 = Saldada (según tu lógica)

            // Pagos del préstamo (via Cuotas)
            var pagos = await _context.Pagos
                .Where(p => _context.Cuotas.Any(c => c.IdCuota == p.IdCuota && c.IdPrestamo == prestamoId))
                .ToListAsync();

            DateTime? ultimaFechaPago = pagos.Any()
                ? pagos.Max(p => p.FecPago)
                : null;

            return new ResumenPrestamoDTO
            {
                IdPrestamo = prestamoId,
                CantidadCuotasOriginales = prestamo.CantidadCtas,
                CantidadCuotasEfectivas = cuotasSaldadas.Count,
                MesesActivo = ultimaFechaPago.HasValue
                    ? CalcularMesesActivo(prestamo.FechaOtorgamiento, ultimaFechaPago.Value)
                    : 0,
                EstadoPrestamo = prestamo.IdEstado
            };
        }
    }
}
    

