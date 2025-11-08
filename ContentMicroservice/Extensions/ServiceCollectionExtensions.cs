using AutoMapper;
using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Application.UseCases;
using ContentMicroservice.Infrastructure.Clients;
using ContentMicroservice.Infrastructure.Config;
using ContentMicroservice.Infrastructure.Persistence;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace ContentMicroservice.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddContentMicroserviceServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Configure Mongo settings
            services.Configure<MongoDbConfig>(configuration.GetSection("Mongo"));
            services.AddSingleton(resolver =>
            {
                var cfg = resolver.GetRequiredService<IOptions<MongoDbConfig>>().Value;
                return new MongoClient(cfg.ConnectionString);
            });

            // Repository
            services.AddScoped<IContentRepository, MongoContentRepository>();

            // Firebase client (stub)
            services.AddSingleton<FirebaseClient>();

            // Use cases
            services.AddScoped<GetTrickUseCase>();
            services.AddScoped<ImportTrickFromYoutubeUseCase>();
            services.AddScoped<UploadUserVideoUseCase>();

            // AutoMapper
            services.AddAutoMapper(typeof(Infrastructure.Mapping.AutoMapperProfile).Assembly);

            return services;
        }

    }
}
