using AutoMapper;
using TuCredito.DTOs;
using TuCredito.Models;

namespace TuCredito.Profiles;
    public class PrestatarioProfile : Profile
    {
        public PrestatarioProfile()
        {
            CreateMap<Prestatario, PrestatarioDTO>()
                .ForMember(dest => dest.GaranteNombre, opt => opt.MapFrom(src => src.IdGaranteNavigation.Nombre))
                .ForMember(dest => dest.GaranteApellido, opt => opt.MapFrom(src => src.IdGaranteNavigation.Apellido))
                .ForMember(dest => dest.GaranteTelefono, opt => opt.MapFrom(src => src.IdGaranteNavigation.Telefono))
                .ForMember(dest => dest.GaranteDomicilio, opt => opt.MapFrom(src => src.IdGaranteNavigation.Domicilio))
                .ForMember(dest => dest.GaranteCorreo, opt => opt.MapFrom(src => src.IdGaranteNavigation.Correo))
                .ForMember(dest => dest.GaranteDni, opt => opt.MapFrom(src => src.IdGaranteNavigation.Dni))
                .ReverseMap()
                .ForPath(dest => dest.IdGaranteNavigation.Nombre, opt => opt.MapFrom(src => src.GaranteNombre))
                .ForPath(dest => dest.IdGaranteNavigation.Apellido, opt => opt.MapFrom(src => src.GaranteApellido))
                .ForPath(dest => dest.IdGaranteNavigation.Telefono, opt => opt.MapFrom(src => src.GaranteTelefono))
                .ForPath(dest => dest.IdGaranteNavigation.Domicilio, opt => opt.MapFrom(src => src.GaranteDomicilio))
                .ForPath(dest => dest.IdGaranteNavigation.Correo, opt => opt.MapFrom(src => src.GaranteCorreo))
                .ForPath(dest => dest.IdGaranteNavigation.Dni, opt => opt.MapFrom(src => src.GaranteDni));

           
        }
    }
