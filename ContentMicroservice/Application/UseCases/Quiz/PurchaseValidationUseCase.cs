using ContentMicroservice.Application.UseCases.UserProgress;
using Microsoft.Extensions.Logging;

namespace ContentMicroservice.Application.UseCases.Quiz
{
    /// <summary>
    /// Stub for purchase validation. In production, validate receipts with Google/Apple servers.
    /// </summary>
    public class PurchaseValidationUseCase
    {
        private readonly UnlockTrickUseCase _unlockUseCase;
        private readonly ILogger<PurchaseValidationUseCase> _logger;

        public PurchaseValidationUseCase(UnlockTrickUseCase unlockUseCase, ILogger<PurchaseValidationUseCase> logger)
        {
            _unlockUseCase = unlockUseCase;
            _logger = logger;
        }

        public async Task<(bool Success, string Message)> ExecuteAsync(string userId, string trickId, string purchaseToken, CancellationToken ct = default)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(purchaseToken))
                {
                    _logger.LogWarning("Empty purchase token from user {UserId}", userId);
                    return (false, "Invalid purchase token");
                }

                // TODO: verify purchaseToken with Google Play / Apple App Store
                _logger.LogInformation("Purchase token accepted (stub) for user {UserId}", userId);

                return await _unlockUseCase.ExecuteAsync(userId, trickId, ct);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error validating purchase for user {UserId} trick {TrickId}", userId, trickId);
                return (false, "Internal error");
            }
        }
    }

}
