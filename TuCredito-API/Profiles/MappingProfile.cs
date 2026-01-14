using AutoMapper;
using TuCredito.Models;
using TuCredito.DTOs;

namespace TuCredito.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Prestamo, PrestamoDTO>();
            CreateMap<PrestamoDTO, Prestamo>();
            CreateMap<Prestatario, PrestatarioDTO>();
            CreateMap<PrestatarioDTO, Prestatario>();
            CreateMap<Pago, PagoOutputDTO>();
            CreateMap<PagoOutputDTO, Pago>();
        }

    }
}
