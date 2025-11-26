using AutoMapper;
using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Application.UseCases.Content;
using ContentMicroservice.Application.UseCases.Progress;
using ContentMicroservice.Application.UseCases.Quiz;
using ContentMicroservice.Application.UseCases.TrickProgress;
using ContentMicroservice.Application.UseCases.UserProgress;
using ContentMicroservice.Infrastructure.Clients;
using ContentMicroservice.Infrastructure.Config;
using ContentMicroservice.Infrastructure.Persistence;
using ContentMicroservice.Infrastructure.Persistence.Repositories;
using ContentMicroservice.Infrastructure.QuestionBank;   // ← IMPORTANT !
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace ContentMicroservice.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddContentMicroserviceServices(this IServiceCollection services, IConfiguration configuration)
        {
            // MongoDB
            services.Configure<MongoDbConfig>(configuration.GetSection("Mongo"));
            services.AddSingleton(resolver =>
            {
                var cfg = resolver.GetRequiredService<IOptions<MongoDbConfig>>().Value;
                return new MongoClient(cfg.ConnectionString);
            });

            // Repositories
            services.AddScoped<IContentRepository, MongoContentRepository>();
            services.AddScoped<IUserProgressRepository, MongoUserProgressRepository>();
            services.AddScoped<IQuizRepository, MongoQuizRepository>();

            // ⚠️ AJOUT DU REPOSITORY DUOLINGO (nouveau)
            services.AddScoped<IUserTrickProgressRepository, UserTrickProgressRepository>();

            // Firebase (stub)
            services.AddSingleton<IFirebaseClient, FirebaseClient>();

            // ⚠️ AJOUT DU QUESTION BANK SERVICE (nouveau)
            services.Configure<QuestionBankOptions>(configuration.GetSection("QuestionBank"));
            services.AddSingleton<IQuestionBank, QuestionBankService>();

            // Content UseCases
            services.AddScoped<GetTrickUseCase>();
            services.AddScoped<GetTrickLearnUseCase>();
            services.AddScoped<UploadUserVideoUseCase>();

            // XP UseCase
            services.AddScoped<AddXPUseCase>();

            // TrickProgress UseCases
            services.AddScoped<GetNextQuestionUseCase>();
            services.AddScoped<SubmitQuestionAnswerUseCase>();

            // UserProgress UseCases
            services.AddScoped<GetUserProgressUseCase>();
            services.AddScoped<UnlockTrickUseCase>();
            services.AddScoped<UpdateDailyProgressUseCase>();
            services.AddScoped<ResetProgressIfNewDayUseCase>();
            services.AddScoped<RecordQuizAttemptUseCase>();
            services.AddScoped<UnlockMiniGameUseCase>();

            // Quiz Use cases   
            services.AddScoped<ValidateQuizUseCase>();
            services.AddScoped<RewardAdCompleteUseCase>();
            services.AddScoped<PurchaseValidationUseCase>();

            // ----------- PARAMÈTRES DE CONFIG -------------
            int dailyLimit = configuration.GetValue<int>("UserProgress:DailyUnlockLimit", 3);
            int maxAttempts = configuration.GetValue<int>("UserProgress:MaxQuizAttempts", 3);

            // ----------- UnlockTrickUseCase -------------
            services.AddScoped(provider =>
            {
                var progress = provider.GetRequiredService<IUserProgressRepository>();
                var content = provider.GetRequiredService<IContentRepository>();
                var addXP = provider.GetRequiredService<AddXPUseCase>();
                var logger = provider.GetRequiredService<ILogger<UnlockTrickUseCase>>();

                return new UnlockTrickUseCase(
                    progress,
                    content,
                    addXP,
                    logger,
                    dailyLimit
                );
            });

            // ----------- ValidateQuizUseCase -------------
            services.AddScoped(provider =>
            {
                var quizRepo = provider.GetRequiredService<IQuizRepository>();
                var record = provider.GetRequiredService<RecordQuizAttemptUseCase>();
                var unlock = provider.GetRequiredService<UnlockTrickUseCase>();
                var content = provider.GetRequiredService<IContentRepository>();
                var logger = provider.GetRequiredService<ILogger<ValidateQuizUseCase>>();

                return new ValidateQuizUseCase(
                    quizRepo,
                    record,
                    unlock,
                    content,
                    logger,
                    maxAttempts
                );
            });

            // AutoMapper
            services.AddAutoMapper(typeof(Infrastructure.Mapping.AutoMapperProfile).Assembly);

            return services;
        }
    }
}
