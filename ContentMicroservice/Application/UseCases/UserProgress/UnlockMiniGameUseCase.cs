using System;
using System.Threading;
using System.Threading.Tasks;
using ContentMicroservice.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    public class UnlockMiniGameUseCase
    {
        private readonly IUserProgressRepository _progressRepo;
        private readonly IContentRepository _contentRepo;
        private readonly ILogger<UnlockMiniGameUseCase> _logger;

        private const int TRICKS_PER_MINIGAME = 2;

        public UnlockMiniGameUseCase(
            IUserProgressRepository progressRepo,
            IContentRepository contentRepo,
            ILogger<UnlockMiniGameUseCase> logger)
        {
            _progressRepo = progressRepo;
            _contentRepo = contentRepo;
            _logger = logger;
        }

        public async Task<(bool Success, string Message)> ExecuteAsync(string userId, string miniGameKey, CancellationToken ct = default)
        {
            var progress = await _progressRepo.GetByUserIdAsync(userId, ct);
            if (progress == null)
            {
                return (false, "User progress not found");
            }

            // Already unlocked ?
            if (progress.UnlockedMiniGames.Contains(miniGameKey))
            {
                return (true, "Already unlocked");
            }

            int totalTricksUnlocked = progress.UnlockedTricks.Count;

            // Number of mini-games that should already be available
            int expectedSlots = totalTricksUnlocked / TRICKS_PER_MINIGAME;
            int usedSlots = progress.UnlockedMiniGames.Count;

            if (usedSlots >= expectedSlots)
            {
                return (false, "Not enough unlocked tricks to unlock this mini-game");
            }

            progress.UnlockedMiniGames.Add(miniGameKey);
            await _progressRepo.SaveAsync(progress, ct);

            return (true, "Mini-game unlocked");
        }
    }
}
