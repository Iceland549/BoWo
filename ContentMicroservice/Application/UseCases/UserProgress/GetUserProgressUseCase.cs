using ContentMicroservice.Application.DTOs;
using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Infrastructure.Persistence.Entities;
using Microsoft.Extensions.Logging;


namespace ContentMicroservice.Application.UseCases.UserProgress
{
    public class GetUserProgressUseCase
    {
        private readonly IUserProgressRepository _repo;
        private readonly ILogger<GetUserProgressUseCase> _logger;

        public GetUserProgressUseCase(IUserProgressRepository repo, ILogger<GetUserProgressUseCase> logger)
        {
            _repo = repo;
            _logger = logger;
        }

        public async Task<UserProgressDto> ExecuteAsync(string userId, CancellationToken ct = default)
        {
            try
            {
                _logger.LogDebug("Fetching progress for user {UserId}", userId);
                var progress = await _repo.GetByUserIdAsync(userId, ct)
                              ?? new ContentMicroservice.Infrastructure.Persistence.Entities.UserProgress { UserId = userId };

                var dto = new UserProgressDto
                {
                    UserId = progress.UserId,
                    UnlockedTricks = progress.UnlockedTricks ?? new System.Collections.Generic.List<string>(),
                    LastUnlockDateUtc = progress.LastUnlockDateUtc,
                    TricksUnlockedToday = progress.TricksUnlockedToday,
                    QuizAttempts = progress.QuizAttempts ?? new System.Collections.Generic.Dictionary<string, int>()
                };

                _logger.LogInformation("Returning progress for user {UserId}: {TotalUnlocked} unlocked, {Today} today",
                    userId, dto.TotalUnlocked, dto.TricksUnlockedToday);

                return dto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while getting progress for user {UserId}", userId);
                throw;
            }
        }
    }

}
