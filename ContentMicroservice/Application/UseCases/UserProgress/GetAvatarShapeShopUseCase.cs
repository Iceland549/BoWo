// FILE: ContentMicroservice.Application/UseCases/UserProgress/GetShapeAvatarShopUseCase.cs
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ContentMicroservice.Application.DTOs;
using ContentMicroservice.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    public sealed class GetShapeAvatarShopUseCase
    {
        private readonly IUserProgressRepository _progressRepo;
        private readonly ILogger<GetShapeAvatarShopUseCase> _logger;

        public GetShapeAvatarShopUseCase(
            IUserProgressRepository progressRepo,
            ILogger<GetShapeAvatarShopUseCase> logger)
        {
            _progressRepo = progressRepo;
            _logger = logger;
        }

        public async Task<ShopDto> ExecuteAsync(string userId, CancellationToken ct = default)
        {
            var progress = await _progressRepo.GetByUserIdAsync(userId, ct)
                           ?? new Infrastructure.Persistence.Entities.UserProgress { UserId = userId };

            progress.UnlockedShapeAvatarIds ??= new List<string>();

            var unlocked = progress.UnlockedShapeAvatarIds;
            var catalog = AvatarCatalog.GetShapeShopCatalog();

            var families = catalog
                .GroupBy(i => i.Family)
                .Select(g => new ShopFamilyDto
                {
                    Key = g.Key,
                    Label = g.Key,
                    Items = g.Select(item => new ShopItemDto
                    {
                        Id = item.Id,
                        DisplayName = item.DisplayName,
                        Family = item.Family,
                        PriceCents = item.PriceCents,
                        Owned = unlocked.Contains(item.Id),
                    }).ToList()
                })
                .ToList();

            _logger.LogDebug("Shape shop returned for user {UserId}. Families={Count}", userId, families.Count);

            return new ShopDto
            {
                // anciennement CurrentShapeAvatarId
                CurrentSelectedId = progress.ShapeAvatarId,
                Families = families
            };
        }
    }
}
