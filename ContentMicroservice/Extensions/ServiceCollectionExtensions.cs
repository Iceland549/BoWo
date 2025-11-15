using AutoMapper;
using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Application.UseCases.Content;
using ContentMicroservice.Application.UseCases.Quiz;
using ContentMicroservice.Application.UseCases.UserProgress;
using ContentMicroservice.Infrastructure.Clients;
using ContentMicroservice.Infrastructure.Config;
using ContentMicroservice.Infrastructure.Persistence;
using ContentMicroservice.Infrastructure.Persistence.Repositories;
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
            services.AddScoped<IUserProgressRepository, MongoUserProgressRepository>();
            services.AddScoped<IQuizRepository, MongoQuizRepository>();

            // Firebase client (stub)
            services.AddSingleton<IFirebaseClient, FirebaseClient>();

            // Use cases - Content
            services.AddScoped<GetTrickUseCase>();
            services.AddScoped<GetTrickLearnUseCase>();
            services.AddScoped<UploadUserVideoUseCase>();

            // Use cases - UserProgress 
            services.AddScoped<GetUserProgressUseCase>();
            services.AddScoped<UnlockTrickUseCase>();
            services.AddScoped<UpdateDailyProgressUseCase>();
            services.AddScoped<ResetProgressIfNewDayUseCase>();
            services.AddScoped<RecordQuizAttemptUseCase>();

            // Use cases - Quiz 
            services.AddScoped<ValidateQuizUseCase>();
            services.AddScoped<RewardAdCompleteUseCase>();
            services.AddScoped<PurchaseValidationUseCase>();

            // Parameters
            int dailyLimit = configuration.GetValue<int>("UserProgress:DailyUnlockLimit", 1);
            int maxAttempts = configuration.GetValue<int>("UserProgress:MaxQuizAttempts", 3);

            services.AddScoped(provider =>
            {
                var up = provider.GetRequiredService<IUserProgressRepository>();
                var content = provider.GetRequiredService<IContentRepository>();
                var log = provider.GetRequiredService<ILogger<UnlockTrickUseCase>>();
                return new UnlockTrickUseCase(up, content, log, dailyLimit);
            });

            services.AddScoped(provider =>
            {
                var quizRepo = provider.GetRequiredService<IQuizRepository>();
                var record = provider.GetRequiredService<RecordQuizAttemptUseCase>();
                var unlock = provider.GetRequiredService<UnlockTrickUseCase>();
                var log = provider.GetRequiredService<ILogger<ValidateQuizUseCase>>();
                return new ValidateQuizUseCase(quizRepo, record, unlock, log, maxAttempts);
            });

            // AutoMapper
            services.AddAutoMapper(typeof(Infrastructure.Mapping.AutoMapperProfile).Assembly);

            return services;
        }

    }
}
