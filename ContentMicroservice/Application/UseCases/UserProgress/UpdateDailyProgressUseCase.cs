using ContentMicroservice.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    /// <summary>
    /// Gère les resets quotidiens + le BoWo Daily Streak.
    /// </summary>
    public class UpdateDailyProgressUseCase
    {
        private readonly IUserProgressRepository _progressRepo;
        private readonly ILogger<UpdateDailyProgressUseCase> _logger;

        public UpdateDailyProgressUseCase(
            IUserProgressRepository progressRepo,
            ILogger<UpdateDailyProgressUseCase> logger)
        {
            _progressRepo = progressRepo;
            _logger = logger;
        }

        public async Task ExecuteEnsureDayResetAsync(string userId, CancellationToken ct = default)
        {
            try
            {
                var progress = await _progressRepo.GetByUserIdAsync(userId, ct)
                              ?? new ContentMicroservice.Infrastructure.Persistence.Entities.UserProgress
                              {
                                  UserId = userId
                              };

                var today = DateTime.UtcNow.Date;
                var lastActivityDate = progress.LastActivityDateUtc?.Date ?? DateTime.MinValue.Date;

                // 1) Gestion du Daily Streak
                if (lastActivityDate == DateTime.MinValue.Date)
                {
                    // Première activité jamais enregistrée
                    progress.DailyStreak = 1;
                }
                else if (lastActivityDate == today)
                {
                    // Déjà compté pour aujourd'hui → ne rien changer
                }
                else if (lastActivityDate == today.AddDays(-1))
                {
                    // Activité hier → on continue le streak
                    progress.DailyStreak += 1;
                }
                else
                {
                    // Pause de plus d'un jour → streak reset
                    progress.DailyStreak = 1;
                }

                // On marque aujourd'hui comme dernière activité "globale"
                progress.LastActivityDateUtc = DateTime.UtcNow;

                // 2) Reset des compteurs quotidiens de déverrouillage si nouveau jour
                if (progress.LastUnlockDateUtc.Date != today)
                {
                    _logger.LogInformation(
                        "Day changed for user {UserId}, resetting TricksUnlockedToday", userId);

                    progress.TricksUnlockedToday = 0;
                    progress.LastUnlockDateUtc = DateTime.UtcNow;
                }

                await _progressRepo.SaveAsync(progress, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in daily progress update for user {UserId}", userId);
                throw;
            }
        }
    }
}
