using ContentMicroservice.Application.DTOs;
using ContentMicroservice.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace ContentMicroservice.Application.UseCases.Content
{
    public class GetTrickLearnUseCase
    {
        private readonly IContentRepository _contentRepo;
        private readonly IUserProgressRepository _progressRepo;
        private readonly ILogger<GetTrickLearnUseCase> _logger;

        public GetTrickLearnUseCase(
            IContentRepository contentRepo,
            IUserProgressRepository progressRepo,
            ILogger<GetTrickLearnUseCase> logger)
        {
            _contentRepo = contentRepo;
            _progressRepo = progressRepo;
            _logger = logger;
        }

        /// <summary>
        /// Retourne le contenu d'apprentissage si le user a déverrouillé le trick.
        /// </summary>
        public async Task<(bool Allowed, TrickLearnDto? Data, string? Error)> ExecuteAsync(
            string userId, string trickId, CancellationToken ct = default)
        {
            // 1) Charger le trick
            var trick = await _contentRepo.GetTrickByIdAsync(trickId, ct);
            if (trick == null)
            {
                _logger.LogWarning("Trick {TrickId} not found", trickId);
                return (false, null, "NotFound");
            }

            // 2) Vérifier le déverrouillage côté progression utilisateur
            var progress = await _progressRepo.GetByUserIdAsync(userId, ct);
            var unlocked = progress?.UnlockedTricks?.Contains(trickId) ?? false;

            if (!unlocked)
            {
                _logger.LogInformation("User {UserId} tried to access locked trick {TrickId}", userId, trickId);
                return (false, null, "Forbidden");
            }

            // 3) Mapper les champs d’apprentissage
            var dto = new TrickLearnDto
            {
                Id = trick.Id,
                Name = trick.Name,
                Description = trick.Description,
                Steps = trick.Steps ?? new List<string>(),
                Images = trick.Images ?? new List<string>(),
                AmateurVideoUrl = trick.Videos?.AmateurUrl,
                ProVideoUrl = trick.Videos?.ProUrl,
            };

            return (true, dto, null);
        }
    }
}
