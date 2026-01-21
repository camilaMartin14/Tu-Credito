using AutoMapper;
using TuCredito.DTOs;
using TuCredito.Models;

namespace TuCredito.Profiles;
    public class PrestamistaProfile : Profile
    {
        public PrestamistaProfile()
        {
            CreateMap<PrestamistaRegisterDto, Prestamista>()
                .ForMember(dest => dest.EsActivo, opt => opt.MapFrom(src => true))
                .ForMember(dest => dest.ContraseniaHash, opt => opt.Ignore()); // Se maneja manualmente el hash
        }
    }
