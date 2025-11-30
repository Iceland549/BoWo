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

            // 2) Images
            if (trick.Images == null || trick.Images.Count == 0)
            {
                _logger.LogWarning("Trick {TrickId} has no images configured", trickId);
                trick.Images = new List<string>();
            }

            // 3) Vidéos (on ne crée pas de nouvel objet, on vérifie juste / log)
            if (trick.Videos == null)
            {
                _logger.LogWarning("Trick {TrickId} has no video section defined", trickId);
            }
            else
            {
                if (string.IsNullOrWhiteSpace(trick.Videos.ProUrl))
                    _logger.LogWarning("Trick {TrickId} has no Pro video", trickId);

                if (string.IsNullOrWhiteSpace(trick.Videos.AmateurUrl))
                    _logger.LogWarning("Trick {TrickId} has no Amateur video", trickId);
            }

            // 4) Vérifier la progression utilisateur
            var progress = await _progressRepo.GetByUserIdAsync(userId, ct);
            var unlocked = progress?.UnlockedTricks?.Contains(trickId) ?? false;

            if (!unlocked)
            {
                _logger.LogInformation(
                    "User {UserId} attempted to access locked trick {TrickId}",
                    userId, trickId);
                return (false, null, "Forbidden");
            }

            // 5) Mapper les données vers le DTO
            var dto = new TrickLearnDto
            {
                Id = trick.Id,
                Name = trick.Name,
                Description = trick.Description ?? string.Empty,
                Steps = trick.Steps ?? new List<string>(),
                Images = trick.Images ?? new List<string>(),
                AmateurVideoUrl = trick.Videos?.AmateurUrl,
                ProVideoUrl = trick.Videos?.ProUrl,
                ProTip = trick.ProTip?.ToList() ?? new List<string>(),
                CommonMistake = trick.CommonMistake?.ToList() ?? new List<string>()
            };

            return (true, dto, null);
        }
    }
}
