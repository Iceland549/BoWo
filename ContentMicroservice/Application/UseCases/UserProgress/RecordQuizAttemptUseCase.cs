using System;
using System.Threading;
using System.Threading.Tasks;
using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Application.UseCases.UserProgress;
using Microsoft.Extensions.Logging;
using ProgressEntity = ContentMicroservice.Infrastructure.Persistence.Entities.UserProgress;

namespace ContentMicroservice.Application.UseCases.Quiz
{
    /// <summary>
    /// Enregistre une tentative ratée sur un quiz pour un trick donné
    /// (par utilisateur).
    /// Sert aussi pour le badge "Full Send".
    /// </summary>
    public class RecordQuizAttemptUseCase
    {
        private readonly IUserProgressRepository _progressRepo;
        private readonly AddXPUseCase _addXpUseCase;
        private readonly ILogger<RecordQuizAttemptUseCase> _logger;

        public RecordQuizAttemptUseCase(
            IUserProgressRepository progressRepo,
            AddXPUseCase addXpUseCase,
            ILogger<RecordQuizAttemptUseCase> logger)
        {
            _progressRepo = progressRepo;
            _addXpUseCase = addXpUseCase;
            _logger = logger;
        }

        /// <summary>
        /// Incrémente le compteur de tentatives pour ce trick
        /// et renvoie le nombre total de tentatives après incrément.
        /// </summary>
        public async Task<int> ExecuteAsync(
            string userId,
            string trickId,
            CancellationToken ct = default)
        {
            var progress = await _progressRepo.GetByUserIdAsync(userId, ct)
                           ?? new ProgressEntity { UserId = userId };

            progress.QuizAttempts ??= new System.Collections.Generic.Dictionary<string, int>();

            if (!progress.QuizAttempts.TryGetValue(trickId, out var attempts))
            {
                attempts = 0;
            }

            attempts++;
            progress.QuizAttempts[trickId] = attempts;

            // Badge FullSend : "Essayer un trick 10 fois d’affilée (10 tentatives ratées enregistrées)."
            if (attempts >= 10 &&
                BadgesCatalog.TryUnlockBadge(progress, BadgesCatalog.FullSend, out var fullSendXp))
            {
                // On applique le bonus XP du badge via AddXPUseCase (pour être cohérent)
                await _addXpUseCase.ExecuteAsync(userId, fullSendXp, ct);
            }

            await _progressRepo.SaveAsync(progress, ct);

            _logger.LogInformation(
                "RecordQuizAttempt: user {UserId}, trick {TrickId}, attempts = {Attempts}",
                userId, trickId, attempts);

            return attempts;
        }
    }
}
