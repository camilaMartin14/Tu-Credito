using AutoMapper;
using TuCredito.DTOs;
using TuCredito.Models;

namespace TuCredito.Profiles;
public class PrestamoProfile : Profile
    {
        public PrestamoProfile()
        {
            CreateMap<Prestamo, PrestamoDTO>().ReverseMap();
           
        }
    }
