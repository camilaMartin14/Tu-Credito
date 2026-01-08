using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Runtime.CompilerServices;
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
        private readonly ICuotaRepository _cuota;
        private readonly IMapper _mapper;
        private readonly TuCreditoContext _context;
        public PrestamoService(IPrestamoRepository prestamo, IMapper mapper, IPrestatarioRepository prestatario, ICuotaRepository cuota, TuCreditoContext context)
        {
            _prestamo = prestamo;
            _prestatario = prestatario;
            _mapper = mapper;
            _cuota = cuota;
            _context = context;
        }
        public async Task<IEnumerable<Prestamo>> GetAll(int page, int pageSize)
        {
            return await _context.Prestamos
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
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
            if (string.IsNullOrWhiteSpace(nombre) || nombre.Any(char.IsDigit))
                throw new ArgumentException("El nombre solo puede contener letras");
            //el estado lo manejaria con un cboBox desde el front
            if (mesVto > 12 || mesVto < 1) throw new ArgumentException("El mes debe estar contenido entre 1 y 12");
            if (estado.Value == 2 && mesVto.HasValue && anio.HasValue)
            {
                var fechaFiltro = new DateTime(anio.Value, mesVto.Value, 1); // constuyo una fecha
                if (fechaFiltro > DateTime.Today) // y la compara con el dia de hoy
                    throw new ArgumentException("Solo se pueden consultar cuotas posteriores para prestamos activos");
            }
            return _prestamo.GetPrestamoConFiltro(nombre, estado, mesVto, anio);
        }

        public async Task<bool> PostPrestamo(PrestamoDTO NvoPrestamo)
        {
            var existe = await _prestatario.ObtenerPorDniAsync(NvoPrestamo.DniPrestatario);
            if (existe == null) throw new ArgumentException("El DNI ingresado no esta registrado");
            if (NvoPrestamo.MontoOtorgado <= 0) throw new ArgumentException("El monto debe ser mayor que cero");
            if (string.IsNullOrWhiteSpace(NvoPrestamo.NombrePrestatario)) throw new ArgumentException("Ingrese un nombre de prestatario"); // el nombre podria venir por defecto al poner el dni 
            if (NvoPrestamo.CantidadCtas <= 0) throw new ArgumentException("Ingrese un numero de cuotas valido");

            var prestamo = _mapper.Map<Prestamo>(NvoPrestamo);

            if (prestamo.FechaOtorgamiento > DateTime.Now) throw new ArgumentException("La fecha de otorgamiento no puede ser futura");
            if (prestamo.FechaOtorgamiento < DateTime.Now.AddMonths(-24)) throw new ArgumentException("La fecha de otorgamiento puede ser de hasta 24 meses anteriores");
            if (prestamo.FechaOtorgamiento > prestamo.FechaFinEstimada) throw new ArgumentException("La fecha estimada de fin no puede ser anterior a la fecha de otrogamiento");
            if (prestamo.FechaOtorgamiento > prestamo.Fec1erVto) throw new ArgumentException("La fecha del primer vencimiento debe ser posterior a la fecha de otorgamiento");
            if (prestamo.FechaFinEstimada < DateTime.Today) throw new ArgumentException("Solo se permiten registrar prestamos que aun esten activos"); // RAROOOO, xq la fecha estimada no es necesariamente la fecha de fin
            if (prestamo.IdEstado != 1) throw new ArgumentException("El estado debe ser 'Activo'"); // por defecto al darlo de alta
            if (prestamo.IdPrestamista <= 0) throw new ArgumentException("Ingrese un numero de prestamista"); // esto tmb deberia venir por defecto por la sesion 
            if (prestamo.IdSistAmortizacion <= 0) throw new ArgumentException("Seleccione un sistema de amortizacion");
            if (prestamo.TasaInteres <= 0) throw new ArgumentException("Ingrese una tasa de interes"); // opciones o vamos a permitir escribir?? 

            await _prestamo.PostPrestamo(NvoPrestamo);
            return true;
        }
        public async Task<bool> SoftDelete(int id)
        {
            var prestamo = await _prestamo.GetPrestamoById(id);
            if (prestamo == null) throw new ArgumentException("El prestamos indicado no existe");
            if (prestamo.IdEstado == 2) throw new ArgumentException("El prestamo ya se encuentra finalizado");
            if (prestamo.IdEstado == 3) throw new ArgumentException("El prestamo indicado esta eliminado");
            if (_prestamo.TienePagosPendientes(id).Result == true) throw new ArgumentException("No se pueden finalizar prestamos que aun tengan pagos pendientes");
            // no se si esta bien planteada la comparacion del resultado. ME HACE RUIDOO
            await _prestamo.SoftDelete(prestamo.IdEstado);
            return true;
        }

        public void GenerarCuotas(Prestamo prestamo)
        {
            decimal montoCuotaDecimal = prestamo.MontoOtorgado / prestamo.CantidadCtas;
            int montoCuotaEntero = (int)Math.Ceiling(montoCuotaDecimal); // desfasaje maximo 1xcuota
            for (int i = 1; i <= prestamo.CantidadCtas; i++)
            {
                prestamo.Cuota.Add(new Cuota
                {
                    NroCuota = i,
                    Monto = montoCuotaEntero,
                    FecVto = prestamo.Fec1erVto.AddMonths(i)
                });
            }
        }

        public async void RegistrarPago(int IdCuota, int montoPagado)
        {
            var cuota = await _cuota.GetById(IdCuota); // de donde vendria el dato? deberia navegar el prestamo 
            var estado = cuota.IdEstado;
            if (cuota == null) throw new Exception("Cuota no encontrada");
            cuota.Pagos.Add(new Pago { Monto = montoPagado, FecPago = DateTime.Now });
            if (cuota.Pagos.Sum(p => p.Monto) >= cuota.Monto) cuota.IdEstado = 3; await _cuota.UpdateCuota(IdCuota, estado); // 3 = saldada
            if (cuota.Pagos.Sum(p => p.Monto) < cuota.Monto) cuota.IdEstado = 1; await _cuota.UpdateCuota(IdCuota, estado); // pendiente - deberiamos manejar el cuanto.
        }

        public async Task RegistrarPagoAnticipado(int prestamoId, int cuotaId, decimal monto)
        {
            var prestamo = await _prestamo.GetPrestamoById(prestamoId);
            if (prestamo == null)
                throw new Exception("Préstamo no encontrado");

            var cuota = await _cuota.GetById(cuotaId);
            if (cuota == null)
                throw new Exception("Cuota no encontrada");

            var ultimaPendiente = _cuota.GetUltimaPendiente(prestamoId);
            if (ultimaPendiente == null)
                throw new Exception("No hay cuotas pendientes para cancelar anticipadamente");

            if (cuota.IdCuota != ultimaPendiente.Id)
                throw new Exception("Solo se permite pagar anticipadamente la última cuota pendiente");

            cuota.Pagos.Add(new Pago
            {
                Monto = monto,
                FecPago = DateTime.Now
            });

            if (cuota.Pagos.Sum(p => p.Monto) >= cuota.Monto)
                cuota.IdEstado = 3; // Pagada
            else
                cuota.IdEstado = 1; // Parcial

            await _cuota.UpdateCuota(cuota.IdCuota, cuota.IdEstado);
        }
    }
}
