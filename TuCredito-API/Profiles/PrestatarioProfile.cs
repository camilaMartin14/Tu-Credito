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
                .ForMember(dest => dest.GaranteCorreo, opt => opt.MapFrom(src => src.IdGaranteNavigation.Correo));

            CreateMap<PrestatarioDTO, Prestatario>();
        }
    }
