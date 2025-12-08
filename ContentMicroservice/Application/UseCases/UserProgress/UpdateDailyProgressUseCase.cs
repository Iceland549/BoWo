using System;
using System.Threading;
using System.Threading.Tasks;
using ContentMicroservice.Application.Interfaces;
using Microsoft.Extensions.Logging;
using ProgressEntity = ContentMicroservice.Infrastructure.Persistence.Entities.UserProgress;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    /// <summary>
    /// Met à jour les infos quotidiennes :
    /// - incrémente ou reset la BoWo Daily Streak
    /// - reset les compteurs journaliers (QuestionsAnsweredToday / XpGainedToday)
    /// - gère les badges liés au streak (StreakRider / Destroyer / Legend)
    /// </summary>
    public class UpdateDailyProgressUseCase
    {
        private readonly IUserProgressRepository _progressRepo;
        private readonly AddXPUseCase _addXPUseCase;
        private readonly ILogger<UpdateDailyProgressUseCase> _logger;

        public UpdateDailyProgressUseCase(
            IUserProgressRepository progressRepo,
            AddXPUseCase addXPUseCase,
            ILogger<UpdateDailyProgressUseCase> logger)
        {
            _progressRepo = progressRepo;
            _addXPUseCase = addXPUseCase;
            _logger = logger;
        }

        public async Task ExecuteAsync(string userId, DateTime utcNow, CancellationToken ct = default)
        {
            var progress = await _progressRepo.GetByUserIdAsync(userId, ct)
                           ?? new ProgressEntity { UserId = userId };

            // ⚠ LastActivityDateUtc est un DateTime? → on protège avec ?.
            var today = utcNow.Date;
            var lastActivityDate = progress.LastActivityDateUtc?.Date ?? DateTime.MinValue.Date;

            // Même jour → rien à faire sur la streak, ni reset des compteurs.
            if (lastActivityDate == today)
            {
                return;
            }

            // Différence en jours pour savoir si streak continue ou reset
            var diffDays = (today - lastActivityDate).TotalDays;

            if (progress.DailyStreak <= 0)
            {
                progress.DailyStreak = 1;
            }
            else if (diffDays == 1)
            {
                progress.DailyStreak++;
            }
            else
            {
                progress.DailyStreak = 1;
            }

            // Toujours mettre à jour la dernière date d'activité
            progress.LastActivityDateUtc = utcNow;

            // Nouvelle journée → reset des compteurs journaliers
            progress.QuestionsAnsweredToday = 0;
            progress.XpGainedToday = 0;

            // Badges de streak + bonus XP associé
            int bonusFromBadges = 0;

            if (progress.DailyStreak >= 3 &&
                BadgesCatalog.TryUnlockBadge(progress, BadgesCatalog.StreakRider, out var riderXp))
            {
                bonusFromBadges += riderXp;
            }

            if (progress.DailyStreak >= 5 &&
                BadgesCatalog.TryUnlockBadge(progress, BadgesCatalog.StreakDestroyer, out var destroyerXp))
            {
                bonusFromBadges += destroyerXp;
            }

            if (progress.DailyStreak >= 10 &&
                BadgesCatalog.TryUnlockBadge(progress, BadgesCatalog.StreakLegend, out var legendXp))
            {
                bonusFromBadges += legendXp;
            }

            await _progressRepo.SaveAsync(progress, ct);

            // On passe par AddXPUseCase pour intégrer le bonus XP (et re-déclencher
            // éventuellement les badges liés à XpGainedToday).
            if (bonusFromBadges > 0)
            {
                await _addXPUseCase.ExecuteAsync(userId, bonusFromBadges, ct);
            }

            _logger.LogInformation(
                "UpdateDailyProgressUseCase: user {UserId}, DailyStreak = {Streak}, bonusFromBadges = {Bonus}",
                userId, progress.DailyStreak, bonusFromBadges
            );
        }
        public Task ExecuteEnsureDayResetAsync(string userId, CancellationToken ct = default)
        {
            // On centralise la logique de date ici : c’est toujours "maintenant" en UTC.
            return ExecuteAsync(userId, DateTime.UtcNow, ct);
        }

    }
}
