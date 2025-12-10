using System;
using System.Threading;
using System.Threading.Tasks;
using ContentMicroservice.Application.DTOs;
using ContentMicroservice.Application.Interfaces;
using Microsoft.Extensions.Logging;
using ProgressEntity = ContentMicroservice.Infrastructure.Persistence.Entities.UserProgress;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    public class UnlockAliveDeckUseCase
    {
        private readonly IUserProgressRepository _progressRepo;
        private readonly ILogger<UnlockAliveDeckUseCase> _logger;

        public UnlockAliveDeckUseCase(
            IUserProgressRepository progressRepo,
            ILogger<UnlockAliveDeckUseCase> logger)
        {
            _progressRepo = progressRepo;
            _logger = logger;
        }

        public async Task<(bool Success, string Message, UserProgressDto? Progress)> ExecuteAsync(
            string userId,
            string deckId,
            CancellationToken ct = default)
        {
            // ✅ Validation de l'id
            if (!AliveDeckCatalog.IsValidAliveDeckId(deckId))
            {
                return (false, "INVALID_DECK_ID", null);
            }

            var progress = await _progressRepo.GetByUserIdAsync(userId, ct);
            if (progress == null)
            {
                progress = new ProgressEntity
                {
                    UserId = userId,
                    XP = 0
                };
            }

            progress.UnlockedAliveDecks ??= new System.Collections.Generic.List<string>();
            progress.UnlockedAliveDecks =
                AliveDeckCatalog.SanitizeUnlockedAliveDecks(progress.UnlockedAliveDecks);

            // déjà débloqué ?
            if (progress.UnlockedAliveDecks.Contains(deckId))
            {
                return (true, "ALREADY_UNLOCKED", MapToDto(progress));
            }

            var tokensAvailable = AliveDeckCatalog.ComputeAvailableTokens(progress);
            if (tokensAvailable <= 0)
            {
                return (false, "NO_TOKENS_AVAILABLE", MapToDto(progress));
            }

            // Consomme 1 token => on ajoute le deck
            progress.UnlockedAliveDecks.Add(deckId);
            await _progressRepo.SaveAsync(progress, ct);

            _logger.LogInformation(
                "Alive deck {DeckId} unlocked for user {UserId}. Tokens remaining: {Tokens}",
                deckId,
                userId,
                AliveDeckCatalog.ComputeAvailableTokens(progress));

            return (true, "UNLOCKED", MapToDto(progress));
        }

        private static UserProgressDto MapToDto(ProgressEntity progress)
        {
            var levelInfo = LevelCalculator.Compute(progress.XP);

            return new UserProgressDto
            {
                UserId = progress.UserId,
                UnlockedTricks = progress.UnlockedTricks,
                LastUnlockDateUtc = progress.LastUnlockDateUtc,
                TricksUnlockedToday = progress.TricksUnlockedToday,
                QuizAttempts = progress.QuizAttempts,

                XP = progress.XP,
                Level = levelInfo.Level,
                // ✅ noms alignés avec LevelCalculator + DTO existants
                XPToNextLevel = levelInfo.XPToNextLevel,
                XpGainedToday = progress.XpGainedToday,

                UnlockedDecks = progress.UnlockedDecks ?? new System.Collections.Generic.List<string>(),
                UnlockedAliveDecks = progress.UnlockedAliveDecks ?? new System.Collections.Generic.List<string>(),
                AliveDeckTokens = AliveDeckCatalog.ComputeAvailableTokens(progress)
            };
        }
    }
}
