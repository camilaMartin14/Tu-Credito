using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Runtime.CompilerServices;
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
        private readonly TuCreditoContext _context;
        private readonly IPrestamistaService _prestamista;
        public PrestamoService(IPrestamoRepository prestamo, IMapper mapper, ICalculadoraService calculadora, IPrestatarioRepository prestatario, TuCreditoContext context, IPrestamistaService prestamista)
        {
            _prestamo = prestamo;
            _prestatario = prestatario;
            _mapper = mapper;
            _calculadora = calculadora;
            _context = context;
            _prestamista = prestamista;
        }
        public async Task<List<Prestamo>> GetAll()
        {
            return await _context.Prestamos
                //.Skip((page - 1) * pageSize)
                //.Take(pageSize)
                .ToListAsync();
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

        public async Task<bool> PostPrestamo(PrestamoDTO NvoPrestamo)
        {
            // Validaciones sobre el DTO
            if (NvoPrestamo.MontoOtorgado <= 0) throw new ArgumentException("El monto debe ser mayor que cero"); 
            if (string.IsNullOrWhiteSpace(NvoPrestamo.NombrePrestatario)) throw new ArgumentException("Ingrese un nombre de prestatario"); 
            if (NvoPrestamo.CantidadCtas <= 0) throw new ArgumentException("Ingrese un número de cuotas válido"); 
            // Validaciones de negocio que requieren datos externos
            var existe = await _prestatario.ObtenerPorDniAsync(NvoPrestamo.DniPrestatario); 
            if (existe == null) throw new ArgumentException("El DNI ingresado no está registrado"); 
            // Ahora sí: mapear
            var entidad = _mapper.Map<Prestamo>(NvoPrestamo); // Validaciones sobre la entidad
            entidad.IdPrestamista = await _prestamista.ObtenerIdUsuarioLogueado();
            if (entidad.FechaOtorgamiento > DateTime.Now) throw new ArgumentException("La fecha de otorgamiento no puede ser futura"); 
            if (entidad.IdEstado != 1) throw new ArgumentException("El estado debe ser 'Activo'"); // etc... await _prestatarlo.PostPrestamo(dto); GenerarCuotas(entidad); return true;
            if (entidad.FechaOtorgamiento < DateTime.Now.AddMonths(-24)) throw new ArgumentException("La fecha de otorgamiento puede ser de hasta 24 meses anteriores");
            if (entidad.FechaOtorgamiento > entidad.FechaFinEstimada) throw new ArgumentException("La fecha estimada de fin no puede ser anterior a la fecha de otrogamiento");
            if (entidad.FechaOtorgamiento > entidad.Fec1erVto) throw new ArgumentException("La fecha del primer vencimiento debe ser posterior a la fecha de otorgamiento");
            if (entidad.FechaFinEstimada < DateTime.Today) throw new ArgumentException("Solo se permiten registrar prestamos que aun esten activos"); // RAROOOO, xq la fecha estimada no es necesariamente la fecha de fin
            if (entidad.IdEstado != 1) throw new ArgumentException("El estado debe ser 'Activo'"); // por defecto al darlo de alta
            if (entidad.IdPrestamista <= 0) throw new ArgumentException("Ingrese un numero de prestamista"); // esto tmb deberia venir por defecto por la sesion 
            if (entidad.IdSistAmortizacion <= 0) throw new ArgumentException("Seleccione un sistema de amortizacion");
            if (entidad.TasaInteres <= 0) throw new ArgumentException("Ingrese una tasa de interes"); // opciones o vamos a permitir escribir?? 

            await _prestamo.PostPrestamo(NvoPrestamo);
            GenerarCuotas(entidad);
            return true;
            
        }
        public async Task<bool> SoftDelete(int id)
        {
            var prestamo = await _prestamo.GetPrestamoById(id);
            if (prestamo == null) throw new ArgumentException("El prestamos indicado no existe");
            if (prestamo.IdEstado == 2) throw new ArgumentException("El prestamo ya se encuentra finalizado");
            if (prestamo.IdEstado == 3) throw new ArgumentException("El prestamo indicado esta eliminado");
            if (_prestamo.TienePagosPendientes(id).Result == true) throw new ArgumentException("No se pueden finalizar prestamos que aun tengan pagos pendientes");
            await _prestamo.SoftDelete(prestamo.IdEstado);
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
                    FecVto = (DateTime)cuotaSimulada.FechaVencimiento
                });
            }
        }
    }

       
    }

