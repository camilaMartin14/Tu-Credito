using AutoMapper;
using TuCredito.DTOs;
using TuCredito.Models;

namespace TuCredito.Profiles;
    public class PagoProfile : Profile
    {
        public PagoProfile()
        {
            CreateMap<Pago, PagoOutputDTO>()
                 .ForMember(dest => dest.NroCuota, opt => opt.MapFrom(src => src.IdCuotaNavigation.NroCuota))
                 .ForMember(dest => dest.CantidadTotalCuotas, opt => opt.MapFrom(src => src.IdCuotaNavigation.IdPrestamoNavigation.CantidadCtas))
                 .ForMember(dest => dest.MedioPago, opt => opt.MapFrom(src => src.IdMedioPago))
                 .ForMember(dest => dest.NombreCliente, opt => opt.MapFrom(src => src.IdCuotaNavigation.IdPrestamoNavigation.DniPrestatarioNavigation.Nombre))
                 .ForMember(dest => dest.ApellidoCliente, opt => opt.MapFrom(src => src.IdCuotaNavigation.IdPrestamoNavigation.DniPrestatarioNavigation.Apellido))
                 .ForMember(dest => dest.DniCliente, opt => opt.MapFrom(src => src.IdCuotaNavigation.IdPrestamoNavigation.DniPrestatarioNavigation.Dni))
                 .ReverseMap();
            

            CreateMap<PagoInputDTO, Pago>()
                .ForMember(dest => dest.FecPago, opt => opt.MapFrom(src => src.FechaPago))
                .ForMember(dest => dest.IdPago, opt => opt.Ignore())
                .ForMember(dest => dest.Saldo, opt => opt.Ignore())
                .ForMember(dest => dest.Estado, opt => opt.Ignore())
                .ForMember(dest => dest.IdCuotaNavigation, opt => opt.Ignore())
                .ForMember(dest => dest.IdMedioPagoNavigation, opt => opt.Ignore())
                .ReverseMap();
        }
    }
