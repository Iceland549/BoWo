// FILE: ContentMicroservice.Application/UseCases/UserProgress/UnlockShopShapeAvatarUseCase.cs
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ContentMicroservice.Application.DTOs;
using ContentMicroservice.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    public sealed class UnlockShopShapeAvatarUseCase
    {
        private readonly IUserProgressRepository _progressRepo;
        private readonly GetUserProgressUseCase _getProgressUseCase;
        private readonly ILogger<UnlockShopShapeAvatarUseCase> _logger;

        public UnlockShopShapeAvatarUseCase(
            IUserProgressRepository progressRepo,
            GetUserProgressUseCase getProgressUseCase,
            ILogger<UnlockShopShapeAvatarUseCase> logger)
        {
            _progressRepo = progressRepo;
            _getProgressUseCase = getProgressUseCase;
            _logger = logger;
        }

        public async Task<(bool Success, string Message, UserProgressDto? Progress)> ExecuteAsync(
            string userId,
            string shapeAvatarId,
            CancellationToken ct = default)
        {
            if (!AvatarCatalog.IsValidShopShape(shapeAvatarId))
                return (false, "INVALID_SHOP_SHAPE_ID", null);

            var progress = await _progressRepo.GetByUserIdAsync(userId, ct)
                           ?? new Infrastructure.Persistence.Entities.UserProgress { UserId = userId };

            progress.UnlockedShapeAvatarIds ??= new List<string>();

            if (!progress.UnlockedShapeAvatarIds.Contains(shapeAvatarId))
                progress.UnlockedShapeAvatarIds.Add(shapeAvatarId);

            // Equip direct après achat (V1)
            progress.ShapeAvatarId = shapeAvatarId;

            await _progressRepo.SaveAsync(progress, ct);

            _logger.LogInformation("Shop shape {ShapeId} unlocked for user {UserId}", shapeAvatarId, userId);

            var dto = await _getProgressUseCase.ExecuteAsync(userId, ct);
            return (true, "UNLOCKED", dto);
        }
    }
}
