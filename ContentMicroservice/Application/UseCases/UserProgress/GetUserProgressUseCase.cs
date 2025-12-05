using System;
using System.Threading;
using System.Threading.Tasks;
using ContentMicroservice.Application.DTOs;
using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Infrastructure.Persistence.Entities;
using Microsoft.Extensions.Logging;
using ProgressEntity = ContentMicroservice.Infrastructure.Persistence.Entities.UserProgress;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    public class GetUserProgressUseCase
    {
        private readonly IUserProgressRepository _progressRepo;
        private readonly IContentRepository _contentRepo;
        private readonly ILogger<GetUserProgressUseCase> _logger;

        public GetUserProgressUseCase(
            IUserProgressRepository progressRepo,
            IContentRepository contentRepo,
            ILogger<GetUserProgressUseCase> logger)
        {
            _progressRepo = progressRepo;
            _contentRepo = contentRepo;
            _logger = logger;
        }

        public async Task<UserProgressDto> ExecuteAsync(string userId, CancellationToken ct = default)
        {
            try
            {
                _logger.LogDebug("Fetching progress for user {UserId}", userId);

                // 1) Charger ou initialiser la progression
                var progress = await _progressRepo.GetByUserIdAsync(userId, ct)
                               ?? new ProgressEntity { UserId = userId };

                progress.UnlockedTricks ??= new System.Collections.Generic.List<string>();
                progress.QuizAttempts ??= new System.Collections.Generic.Dictionary<string, int>();
                progress.UnlockedMiniGames ??= new System.Collections.Generic.List<string>();
                progress.UnlockedShapeAvatarIds ??= new System.Collections.Generic.List<string>();

                // 2) Auto-débloquer le mini-jeu "coin-flip" si 3 tricks ou plus
                if (progress.UnlockedTricks.Count >= 3 &&
                    !progress.UnlockedMiniGames.Contains("coin-flip"))
                {
                    progress.UnlockedMiniGames.Add("coin-flip");
                    await _progressRepo.SaveAsync(progress, ct);

                    _logger.LogInformation(
                        "Auto-unlocked mini-game 'coin-flip' for user {UserId} (GetUserProgress)",
                        userId);
                }

                // 3) Nombre total de tricks disponibles
                var tricks = await _contentRepo.GetAllTricksAsync(ct);
                var totalTricks = tricks?.Count ?? 0;

                var totalUnlocked = progress.UnlockedTricks.Count;
                var completionPercent = totalTricks == 0
                    ? 0
                    : (int)((double)totalUnlocked / totalTricks * 100);

                // 4) Calcul du niveau global via LevelCalculator
                var levelInfo = LevelCalculator.Compute(progress.XP);

                // 5) Synchroniser les avatars forme en fonction du niveau
                AvatarCatalog.ApplyToUserProgress(progress, levelInfo.Level);

                // Sauvegarde si on a potentiellement modifié les avatars / mini-jeux
                await _progressRepo.SaveAsync(progress, ct);

                // 6) Construire le DTO
                var dto = new UserProgressDto
                {
                    UserId = progress.UserId,
                    UnlockedTricks = progress.UnlockedTricks,
                    LastUnlockDateUtc = progress.LastUnlockDateUtc,
                    TricksUnlockedToday = progress.TricksUnlockedToday,
                    QuizAttempts = progress.QuizAttempts,

                    XP = progress.XP,
                    Level = levelInfo.Level,
                    LevelTitle = levelInfo.LevelTitle,
                    LevelEmoji = levelInfo.LevelEmoji,
                    CurrentLevelMinXP = levelInfo.CurrentLevelMinXP,
                    NextLevelMinXP = levelInfo.NextLevelMinXP,
                    XPToNextLevel = levelInfo.XPToNextLevel,
                    MaxDefinedLevel = levelInfo.MaxDefinedLevel,

                    TotalTricksAvailable = totalTricks,
                    CompletionPercent = completionPercent,
                    UnlockedMiniGames = progress.UnlockedMiniGames,
                    DailyStreak = progress.DailyStreak,

                    // Avatars actuels
                    BubbleAvatarId = progress.BubbleAvatarId,
                    ShapeAvatarId = progress.ShapeAvatarId,

                    // Avatars disponibles pour le front
                    AvailableBubbleAvatarIds = AvatarCatalog
                        .GetAvailableBubbleAvatars(levelInfo.Level, progress.BubbleAvatarId),
                    AvailableShapeAvatarIds = new System.Collections.Generic.List<string>(
                        progress.UnlockedShapeAvatarIds)
                };

                _logger.LogInformation(
                    "Returning progress for user {UserId}: {TotalUnlocked} unlocked, {Today} today, {XP} XP, level {Level} ({Title}), {TotalTricks} tricks available, {MiniGames} mini-games",
                    userId,
                    dto.TotalUnlocked,
                    dto.TricksUnlockedToday,
                    dto.XP,
                    dto.Level,
                    dto.LevelTitle,
                    dto.TotalTricksAvailable,
                    dto.UnlockedMiniGames?.Count ?? 0
                );

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

