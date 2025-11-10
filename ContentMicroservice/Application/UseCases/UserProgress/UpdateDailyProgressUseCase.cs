using ContentMicroservice.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    /// <summary>
    /// Utility usecase to increment counters or reset when day changes.
    /// </summary>
    public class UpdateDailyProgressUseCase
    {
        private readonly IUserProgressRepository _progressRepo;
        private readonly ILogger<UpdateDailyProgressUseCase> _logger;

        public UpdateDailyProgressUseCase(IUserProgressRepository progressRepo, ILogger<UpdateDailyProgressUseCase> logger)
        {
            _progressRepo = progressRepo;
            _logger = logger;
        }

        public async Task ExecuteEnsureDayResetAsync(string userId, CancellationToken ct = default)
        {
            try
            {
                var progress = await _progressRepo.GetByUserIdAsync(userId, ct)
                              ?? new ContentMicroservice.Infrastructure.Persistence.Entities.UserProgress { UserId = userId };

                if (progress.LastUnlockDateUtc.Date != DateTime.UtcNow.Date)
                {
                    _logger.LogInformation("Day changed for user {UserId}, resetting TricksUnlockedToday and QuizAttempts", userId);
                    progress.TricksUnlockedToday = 0;
                    // Optionally clear quiz attempts for the day. Here we keep attempts per trick overall.
                    progress.LastUnlockDateUtc = DateTime.UtcNow;
                    await _progressRepo.SaveAsync(progress, ct);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in daily progress reset for user {UserId}", userId);
                throw;
            }
        }
    }
}


