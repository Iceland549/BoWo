using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ContentMicroservice.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    public class UnlockTrickUseCase
    {
        private readonly IUserProgressRepository _progressRepo;
        private readonly IContentRepository _contentRepo;
        private readonly AddXPUseCase _addXP;
        private readonly ILogger<UnlockTrickUseCase> _logger;
        private readonly int _dailyLimit;

        public UnlockTrickUseCase(
            IUserProgressRepository progressRepo,
            IContentRepository contentRepo,
            AddXPUseCase addXP,
            ILogger<UnlockTrickUseCase> logger,
            int dailyLimit = 3)
        {
            _progressRepo = progressRepo;
            _contentRepo = contentRepo;
            _addXP = addXP;
            _logger = logger;
            _dailyLimit = dailyLimit;
        }

        public async Task<(bool Success, string Message)> ExecuteAsync(string userId, string trickId, CancellationToken ct = default)
        {
            try
            {
                _logger.LogDebug("Attempting to unlock trick {TrickId} for user {UserId}", trickId, userId);

                var trick = await _contentRepo.GetTrickByIdAsync(trickId, ct);
                if (trick == null)
                {
                    _logger.LogWarning("Trick {TrickId} not found", trickId);
                    return (false, "Trick not found");
                }

                var progress = await _progressRepo.GetByUserIdAsync(userId, ct)
                              ?? new ContentMicroservice.Infrastructure.Persistence.Entities.UserProgress { UserId = userId };

                // Reset counter if new day
                if (progress.LastUnlockDateUtc.Date != DateTime.UtcNow.Date)
                {
                    _logger.LogDebug("Resetting daily counters for user {UserId} (new day)", userId);
                    progress.TricksUnlockedToday = 0;
                }

                if (progress.UnlockedTricks?.Contains(trickId) == true)
                {
                    return (true, "Already unlocked");
                }

                if (progress.TricksUnlockedToday >= _dailyLimit)
                {
                    return (false, "Daily unlock limit reached");
                }

                // Perform unlock
                progress.UnlockedTricks ??= new List<string>();
                progress.UnlockedTricks.Add(trickId);
                progress.TricksUnlockedToday += 1;
                progress.LastUnlockDateUtc = DateTime.UtcNow;

                // ❌ SUPPRESSION : auto-unlock FlipCoin
                // On ne débloque plus automatiquement de mini-jeu ici

                await _progressRepo.SaveAsync(progress, ct);

                // Add XP
                try
                {
                    const int XP_UNLOCK_TRICK = 120;
                    await _addXP.ExecuteAsync(userId, XP_UNLOCK_TRICK, ct);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error while adding XP after unlocking trick");
                }

                return (true, "Unlocked");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during unlocking trick {TrickId} for user {UserId}", trickId, userId);
                return (false, "Internal error");
            }
        }
    }
}
