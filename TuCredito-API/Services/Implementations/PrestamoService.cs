using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TuCredito.Controllers;
using TuCredito.DTOs;
using TuCredito.Models;
using TuCredito.Repositories.Interfaces;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations
{
    public class PrestamoService : IPrestamoService
    {
        private readonly IPrestamoRepository _prestamo;
        private readonly IPrestatarioRepository _prestatario;
        private readonly ICalculadoraService _calculadora;
        private readonly IMapper _mapper;
        private readonly IPrestamistaService _prestamista;
        private readonly ICuotaRepository _cuota;
        private readonly IPagoService _pago;
        public PrestamoService(IPrestamoRepository prestamo, IMapper mapper, ICalculadoraService calculadora, IPrestatarioRepository prestatario, IPrestamistaService prestamista, ICuotaRepository cuota, IPagoService pago)
        {
            _prestamo = prestamo;
            _prestatario = prestatario;
            _mapper = mapper;
            _calculadora = calculadora;
            _prestamista = prestamista;
            _cuota = cuota;
            _pago = pago;
        }
        public async Task<List<PrestamoDTO>> GetAll()
        {
            return await _prestamo.GetAllPrestamo();
        }


        public async Task<PrestamoDTO> GetPrestamoById(int id) // que el id sea + q 0 y q exista
        {
            if (id <= 0) throw new ArgumentException("ID inválido");
            var prestamo = await _prestamo.GetPrestamoById(id);
            if (prestamo == null) throw new Exception("Préstamo no encontrado");
            return prestamo;
        }

        public Task<List<PrestamoDTO>> GetPrestamoConFiltro(string? nombre, int? estado, int? mesVto, int? anio)
        {
            if (!string.IsNullOrWhiteSpace(nombre) && nombre.Any(char.IsDigit))
                throw new ArgumentException("El nombre solo puede contener letras");
            //el estado lo manejaria con un cboBox desde el front
            if (mesVto.HasValue && (mesVto > 12 || mesVto < 1)) throw new ArgumentException("El mes debe estar contenido entre 1 y 12");
            if (estado.HasValue && estado.Value == 2 && mesVto.HasValue && anio.HasValue)

            {
                var fechaFiltro = new DateTime(anio.Value, mesVto.Value, 1); // constuyo una fecha
                if (fechaFiltro > DateTime.Today) // y la compara con el dia de hoy
                    throw new ArgumentException("Solo se pueden consultar cuotas posteriores para prestamos activos");
            }
            return _prestamo.GetPrestamoConFiltro(nombre, estado, mesVto, anio);
        }

        // Ggenerar las cuotas en la entidad antes de persistir todo junto
        public async Task<bool> PostPrestamo(PrestamoDTO NvoPrestamo)
        {
            // Validaciones sobre el DTO
            if (NvoPrestamo.MontoOtorgado <= 0) throw new ArgumentException("El monto debe ser mayor que cero"); 
            if (string.IsNullOrWhiteSpace(NvoPrestamo.NombrePrestatario)) throw new ArgumentException("Ingrese un nombre de prestatario"); 
            if (NvoPrestamo.CantidadCtas <= 0) throw new ArgumentException("Ingrese un número de cuotas válido"); 
            // Validaciones de negocio que requieren datos externos
            var existe = await _prestatario.ObtenerPorDniAsync(NvoPrestamo.DniPrestatario); 
            if (existe == null) throw new ArgumentException("El DNI ingresado no está registrado"); 
            
            var entidad = _mapper.Map<Prestamo>(NvoPrestamo); // Validaciones sobre la entidad
            entidad.IdPrestamista = await _prestamista.ObtenerIdUsuarioLogueado();
            
            // Inicializar SaldoRestante con el monto otorgado
            entidad.SaldoRestante = entidad.MontoOtorgado;

            // CORRECCION: Calcular FechaFinEstimada automáticamente basada en la cantidad de cuotas
            entidad.FechaFinEstimada = entidad.FechaOtorgamiento.AddMonths(entidad.CantidadCtas);

            if (entidad.FechaOtorgamiento > DateTime.Now) throw new ArgumentException("La fecha de otorgamiento no puede ser futura"); 
            if (entidad.IdEstado != 1) throw new ArgumentException("El estado debe ser 'Activo'"); // etc... 
            if (entidad.FechaOtorgamiento < DateTime.Now.AddMonths(-24)) throw new ArgumentException("La fecha de otorgamiento puede ser de hasta 24 meses anteriores");
            if (entidad.FechaOtorgamiento > entidad.Fec1erVto) throw new ArgumentException("La fecha del primer vencimiento debe ser posterior a la fecha de otorgamiento");
            

            if (entidad.IdPrestamista <= 0) throw new ArgumentException("Ingrese un numero de prestamista"); // esto tmb deberia venir por defecto por la sesion 
            if (entidad.IdSistAmortizacion <= 0) throw new ArgumentException("Seleccione un sistema de amortizacion");
            if (entidad.TasaInteres <= 0) throw new ArgumentException("Ingrese una tasa de interes"); // opciones o vamos a permitir escribir?? 

            GenerarCuotas(entidad);

            await _prestamo.PostPrestamo(entidad);
            return true;
            
        }
        public async Task<bool> SoftDelete(int id)
        {
            var prestamo = await _prestamo.GetPrestamoById(id);
            if (prestamo == null) throw new ArgumentException("El prestamos indicado no existe");
            if (prestamo.IdEstado == 2) throw new ArgumentException("El prestamo ya se encuentra finalizado");
            if (prestamo.IdEstado == 3) throw new ArgumentException("El prestamo indicado esta eliminado");
            if (await _prestamo.TienePagosPendientes(id)) throw new ArgumentException("No se pueden finalizar prestamos que aun tengan pagos pendientes");
            await _prestamo.SoftDelete(id);
            return true;
        }

        public void GenerarCuotas(Prestamo prestamo)
        {
            var simulacion = _calculadora.CalcularSimulacion(new SimulacionPrestamoEntryDTO
            {
                MontoPrestamo = prestamo.MontoOtorgado,
                CantidadCuotas = prestamo.CantidadCtas,
                InteresMensual = prestamo.TasaInteres,
                FechaInicio = prestamo.FechaOtorgamiento
            });

            for (int i = 0; i < simulacion.DetalleCuotas.Count; i++)
            {
                var cuotaSimulada = simulacion.DetalleCuotas[i];

                prestamo.Cuota.Add(new Cuota
                {
                    NroCuota = cuotaSimulada.NumeroCuota,
                    Monto = cuotaSimulada.Monto,
                    SaldoPendiente = cuotaSimulada.Monto, // CORRECCION: Inicializar SaldoPendiente igual al Monto
                    IdEstado = 1, // 1 = Pendiente
                    FecVto = cuotaSimulada.FechaVencimiento ?? throw new InvalidOperationException("Fecha de vencimiento no calculada")
                });
            }
        }

        public async Task<Prestamo> GetPrestamoEntityById(int id) 
        { 
            return await _prestamo.GetPrestamoEntityById(id); 
        }

        private int CalcularMesesActivo(DateTime inicio, DateTime fin)
        {
            return (fin.Year - inicio.Year) * 12 + fin.Month - inicio.Month + 1;
        }

        public async Task<ResumenPrestamoDTO> GetResumenPrestamo(int prestamoId)
        {
            if (prestamoId <= 0) throw new ArgumentException("ID inválido");

            var prestamo = await _prestamo.GetPrestamoEntityById(prestamoId);
            if (prestamo == null) throw new Exception("Préstamo no encontrado");

            var cuotas = await _cuota.GetAll(prestamoId);

            var cuotasSaldadas = cuotas.Where(c => c.IdEstado == 2) // Saldada
                                       .ToList();
            var pagos = await _pago.GetPagoByIdPrestamo(prestamoId);

            DateTime? ultimaFechaPago = pagos.Any()? pagos.Max(p => p.FecPago): null;

            return new ResumenPrestamoDTO
            {
                IdPrestamo = prestamoId,
                CantidadCuotasOriginales = prestamo.CantidadCtas,
                CantidadCuotasEfectivas = cuotasSaldadas.Count,
                MesesActivo = ultimaFechaPago.HasValue? 
                CalcularMesesActivo(prestamo.FechaOtorgamiento, ultimaFechaPago.Value) : 0, EstadoPrestamo = prestamo.IdEstado
            };
        }
    }

       
    }
