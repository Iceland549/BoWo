using System;
using System.Threading;
using System.Threading.Tasks;
using ContentMicroservice.Application.Interfaces;
using Microsoft.Extensions.Logging;
using ProgressEntity = ContentMicroservice.Infrastructure.Persistence.Entities.UserProgress;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    /// <summary>
    /// Utilitaire simple pour ajouter de l'XP à un utilisateur.
    /// </summary>
    public class AddXPUseCase
    {
        private readonly IUserProgressRepository _progressRepo;
        private readonly ILogger<AddXPUseCase> _logger;

        public AddXPUseCase(
            IUserProgressRepository progressRepo,
            ILogger<AddXPUseCase> logger)
        {
            _progressRepo = progressRepo;
            _logger = logger;
        }

        public async Task ExecuteAsync(string userId, int amount, CancellationToken ct = default)
        {
            if (amount <= 0)
            {
                return;
            }

            try
            {
                var progress = await _progressRepo.GetByUserIdAsync(userId, ct)
                               ?? new ProgressEntity { UserId = userId };

                progress.XP += amount;
                progress.LastActivityDateUtc = DateTime.UtcNow;

                await _progressRepo.SaveAsync(progress, ct);

                _logger.LogInformation(
                    "Added {Amount} XP to user {UserId}. New total XP: {XP}",
                    amount, userId, progress.XP);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while adding XP for user {UserId}", userId);
                // On log, mais on ne jette pas forcément l'exception plus haut
                // si on veut que l'action principale (unlock) reste OK.
                throw;
            }
        }
    }
}
