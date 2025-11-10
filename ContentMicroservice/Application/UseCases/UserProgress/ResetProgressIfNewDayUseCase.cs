using ContentMicroservice.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    /// <summary>
    /// Explicit reset utility (can be used by admin or scheduled job).
    /// </summary>
    public class ResetProgressIfNewDayUseCase
    {
        private readonly IUserProgressRepository _progressRepo;
        private readonly ILogger<ResetProgressIfNewDayUseCase> _logger;

        public ResetProgressIfNewDayUseCase(IUserProgressRepository progressRepo, ILogger<ResetProgressIfNewDayUseCase> logger)
        {
            _progressRepo = progressRepo;
            _logger = logger;
        }

        public async Task ExecuteAsync(string userId, CancellationToken ct = default)
        {
            try
            {
                var progress = await _progressRepo.GetByUserIdAsync(userId, ct);
                if (progress == null) return;

                if (progress.LastUnlockDateUtc.Date != DateTime.UtcNow.Date)
                {
                    _logger.LogInformation("Resetting progress counters for user {UserId}", userId);
                    progress.TricksUnlockedToday = 0;
                    progress.QuizAttempts.Clear();
                    progress.LastUnlockDateUtc = DateTime.UtcNow;
                    await _progressRepo.SaveAsync(progress, ct);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting progress for user {UserId}", userId);
                throw;
            }
        }
    }

}
