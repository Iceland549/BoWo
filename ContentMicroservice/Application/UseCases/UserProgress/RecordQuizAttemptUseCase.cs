using ContentMicroservice.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    /// <summary>
    /// Records an incorrect quiz attempt for a given user/trick.
    /// </summary>
    public class RecordQuizAttemptUseCase
    {
        private readonly IUserProgressRepository _progressRepo;
        private readonly ILogger<RecordQuizAttemptUseCase> _logger;

        public RecordQuizAttemptUseCase(IUserProgressRepository progressRepo, ILogger<RecordQuizAttemptUseCase> logger)
        {
            _progressRepo = progressRepo;
            _logger = logger;
        }

        public async Task<int> ExecuteAsync(string userId, string trickId, CancellationToken ct = default)
        {
            try
            {
                var progress = await _progressRepo.GetByUserIdAsync(userId, ct)
                              ?? new ContentMicroservice.Infrastructure.Persistence.Entities.UserProgress { UserId = userId };

                if (progress.QuizAttempts == null)
                    progress.QuizAttempts = new System.Collections.Generic.Dictionary<string, int>();

                progress.QuizAttempts.TryGetValue(trickId, out var attempts);
                attempts++;
                progress.QuizAttempts[trickId] = attempts;

                await _progressRepo.SaveAsync(progress, ct);
                _logger.LogInformation("Recorded quiz attempt #{Attempts} for user {UserId} on trick {TrickId}", attempts, userId, trickId);

                return attempts;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording quiz attempt for user {UserId} trick {TrickId}", userId, trickId);
                throw;
            }
        }
    }

}
