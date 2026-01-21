using AutoMapper;
using TuCredito.DTOs;
using TuCredito.Models;

namespace TuCredito.Profiles;
    public class PagoProfile : Profile
    {
        public PagoProfile()
        {
            CreateMap<Pago, PagoOutputDTO>()
                 .ForMember(dest => dest.NroCuota, opt => opt.MapFrom(src => src.IdCuotaNavigation.NroCuota));
            CreateMap<PagoOutputDTO, Pago>();

            CreateMap<PagoInputDTO, Pago>()
                .ForMember(dest => dest.FecPago, opt => opt.MapFrom(src => DateTime.Now));
        }
    }
