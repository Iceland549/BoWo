using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ContentMicroservice.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    /// <summary>
    /// Orchestrates unlocking a trick for a user, enforcing daily limits.
    /// Expects that preconditions (quiz success, ad validation, purchase validation) are handled before calling.
    /// </summary>
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

                // check trick exists
                var trick = await _contentRepo.GetTrickByIdAsync(trickId, ct);
                if (trick == null)
                {
                    _logger.LogWarning("Trick {TrickId} not found", trickId);
                    return (false, "Trick not found");
                }

                var progress = await _progressRepo.GetByUserIdAsync(userId, ct)
                              ?? new ContentMicroservice.Infrastructure.Persistence.Entities.UserProgress { UserId = userId };

                // reset daily counter if day changed (UTC)
                if (progress.LastUnlockDateUtc.Date != DateTime.UtcNow.Date)
                {
                    _logger.LogDebug("Resetting daily counters for user {UserId} (new day)", userId);
                    progress.TricksUnlockedToday = 0;
                }

                // already unlocked?
                if (progress.UnlockedTricks?.Contains(trickId) == true)
                {
                    _logger.LogInformation("User {UserId} already unlocked trick {TrickId}", userId, trickId);
                    return (true, "Already unlocked");
                }

                if (progress.TricksUnlockedToday >= _dailyLimit)
                {
                    _logger.LogInformation("User {UserId} reached daily limit ({Limit})", userId, _dailyLimit);
                    return (false, "Daily unlock limit reached");
                }

                // perform unlock
                progress.UnlockedTricks ??= new List<string>();
                progress.UnlockedTricks.Add(trickId);
                progress.TricksUnlockedToday += 1;
                progress.LastUnlockDateUtc = DateTime.UtcNow;

                // --- NOUVEAU : Déblocage automatique du mini-jeu Flip Coin ---
                if (progress.UnlockedTricks.Count >= 3 &&
                    !progress.UnlockedMiniGames.Contains("coin-flip"))
                {
                    progress.UnlockedMiniGames ??= new List<string>();
                    progress.UnlockedMiniGames.Add("coin-flip");

                    _logger.LogInformation("Mini-game 'coin-flip' unlocked for user {UserId}", userId);
                }

                await _progressRepo.SaveAsync(progress, ct);
                _logger.LogInformation(
                    "User {UserId} unlocked trick {TrickId}. Today unlocked: {Count}",
                    userId, trickId, progress.TricksUnlockedToday
                );

                // --- NOUVEAU : AJOUT XP SUR DÉBLOCAGE ---
                try
                {
                    const int XP_UNLOCK_TRICK = 120; // table XP officielle
                    await _addXP.ExecuteAsync(userId, XP_UNLOCK_TRICK, ct);
                }
                catch (Exception ex)
                {
                    // On ne casse pas l'UNLOCK si l'XP bugge, on log seulement
                    _logger.LogError(ex,
                        "Error while adding XP after unlock for user {UserId} trick {TrickId}",
                        userId, trickId);
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
