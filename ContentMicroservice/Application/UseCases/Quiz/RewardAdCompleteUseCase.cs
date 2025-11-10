using ContentMicroservice.Application.UseCases.UserProgress;
using Microsoft.Extensions.Logging;

namespace ContentMicroservice.Application.UseCases.Quiz
{
    /// <summary>
    /// Stub to validate a rewarded ad token and unlock a trick.
    /// In production, validate token with the ad network on server side.
    /// </summary>
    public class RewardAdCompleteUseCase
    {
        private readonly UnlockTrickUseCase _unlockUseCase;
        private readonly ILogger<RewardAdCompleteUseCase> _logger;

        public RewardAdCompleteUseCase(UnlockTrickUseCase unlockUseCase, ILogger<RewardAdCompleteUseCase> logger)
        {
            _unlockUseCase = unlockUseCase;
            _logger = logger;
        }

        public async Task<(bool Success, string Message)> ExecuteAsync(string userId, string trickId, string adToken, CancellationToken ct = default)
        {
            try
            {
                _logger.LogDebug("Validating ad token for user {UserId} trick {TrickId}", userId, trickId);

                if (string.IsNullOrWhiteSpace(adToken))
                {
                    _logger.LogWarning("Invalid ad token from user {UserId}", userId);
                    return (false, "Invalid ad token");
                }

                // TODO: Integrate with real ad verification provider.
                _logger.LogInformation("Ad token accepted (stub) for user {UserId}", userId);

                return await _unlockUseCase.ExecuteAsync(userId, trickId, ct);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error validating ad token for user {UserId} trick {TrickId}", userId, trickId);
                return (false, "Internal error");
            }
        }
    }

}
