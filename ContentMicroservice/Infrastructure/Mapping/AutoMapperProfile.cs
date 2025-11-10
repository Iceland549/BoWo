using AutoMapper;
using ContentMicroservice.Application.DTOs;
using ContentMicroservice.Infrastructure.Persistence.Entities;

namespace ContentMicroservice.Infrastructure.Mapping
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Content
            CreateMap<Trick, TrickDto>().ReverseMap();
            CreateMap<Video, VideoDto>().ReverseMap();
            CreateMap<UserProfile, ContentMicroservice.Application.DTOs.TrickDto>().IgnoreAllPropertiesWithAnInaccessibleSetter();

            // User Progress & Quiz
            CreateMap<UserProgress, UserProgressDto>().ReverseMap();
            CreateMap<Quiz, QuizDto>().ReverseMap();
        }

    }
}
