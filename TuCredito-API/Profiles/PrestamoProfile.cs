using AutoMapper;
using TuCredito.DTOs;
using TuCredito.Models;

namespace TuCredito.Profiles;
public class PrestamoProfile : Profile
    {
        public PrestamoProfile()
        {
            CreateMap<Prestamo, PrestamoDTO>()
                .ForMember(dest => dest.NombrePrestatario, opt => opt.MapFrom(src => src.DniPrestatarioNavigation != null ? $"{src.DniPrestatarioNavigation.Nombre} {src.DniPrestatarioNavigation.Apellido}" : string.Empty))
                .ReverseMap()
                .ForMember(dest => dest.DniPrestatarioNavigation, opt => opt.Ignore())
                .ForMember(dest => dest.IdPrestamo, opt => opt.Ignore())
                .ForMember(dest => dest.IdPrestamista, opt => opt.Ignore())
                .ForMember(dest => dest.SaldoRestante, opt => opt.Ignore())
                .ForMember(dest => dest.FechaFinEstimada, opt => opt.Ignore())
                .ForMember(dest => dest.Cuota, opt => opt.Ignore())
                .ForMember(dest => dest.IdEstadoNavigation, opt => opt.Ignore())
                .ForMember(dest => dest.IdPrestamistaNavigation, opt => opt.Ignore())
                .ForMember(dest => dest.IdSistAmortizacionNavigation, opt => opt.Ignore());
        }
    }
