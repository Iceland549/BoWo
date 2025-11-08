using AutoMapper;
using ContentMicroservice.Application.DTOs;
using ContentMicroservice.Infrastructure.Persistence.Entities;

namespace ContentMicroservice.Infrastructure.Mapping
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<Trick, TrickDto>().ReverseMap();
            CreateMap<Video, VideoDto>().ReverseMap();
            CreateMap<UserProfile, ContentMicroservice.Application.DTOs.TrickDto>().IgnoreAllPropertiesWithAnInaccessibleSetter();
        }

    }
}
