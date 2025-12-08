using System;
using System.Threading;
using System.Threading.Tasks;
using ContentMicroservice.Application.Interfaces;
using Microsoft.Extensions.Logging;
using ProgressEntity = ContentMicroservice.Infrastructure.Persistence.Entities.UserProgress;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    /// <summary>
    /// Ajoute de l'XP globale à l'utilisateur ET déclenche
    /// les badges dépendants de l'XP, des questions du jour,
    /// des tricks débloqués, des avatars, de la streak, etc.
    /// 
    /// Couvre :
    /// - QuickThinker       (5 questions dans la journée)
    /// - TrickMachine       (20 questions dans la journée)
    /// - XpHunter           (500 XP gagnés dans la journée)
    /// - Kickstart          (1 trick débloqué)
    /// - ParkExplorer       (5 tricks débloqués)
    /// - ParkDominator      (10 tricks débloqués)
    /// - EarlyBird          (activité 6h-9h)
    /// - MidnightSession    (activité 22h-2h)
    /// - AvatarCollector    (5 avatars shape)
    /// - UltimateCollector  (10 avatars shape)
    /// - StreakRider / Destroyer / Legend (via DailyStreak déjà maj)
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
            try
            {
                var progress = await _progressRepo.GetByUserIdAsync(userId, ct)
                               ?? new ProgressEntity { UserId = userId };

                // ----------------- XP de base -----------------
                progress.XP += amount;
                progress.XpGainedToday += amount;

                // On considère que les +20 XP viennent des bonnes réponses de quiz.
                if (amount == 20)
                {
                    progress.QuestionsAnsweredToday++;
                }

                int bonusFromBadges = 0;

                // ---------- 1) Badges basés sur l'XP du jour ----------
                if (progress.XpGainedToday >= 500 &&
                    BadgesCatalog.TryUnlockBadge(progress, BadgesCatalog.XpHunter, out var xpHunterXp))
                {
                    bonusFromBadges += xpHunterXp;
                }

                // ---------- 2) Badges basés sur les questions du jour ----------
                if (progress.QuestionsAnsweredToday >= 5 &&
                    BadgesCatalog.TryUnlockBadge(progress, BadgesCatalog.QuickThinker, out var quickXp))
                {
                    bonusFromBadges += quickXp;
                }

                if (progress.QuestionsAnsweredToday >= 20 &&
                    BadgesCatalog.TryUnlockBadge(progress, BadgesCatalog.TrickMachine, out var machineXp))
                {
                    bonusFromBadges += machineXp;
                }

                // ---------- 3) Badges basés sur les tricks débloqués ----------
                var unlockedTricksCount = progress.UnlockedTricks?.Count ?? 0;

                if (unlockedTricksCount >= 1 &&
                    BadgesCatalog.TryUnlockBadge(progress, BadgesCatalog.Kickstart, out var kickstartXp))
                {
                    bonusFromBadges += kickstartXp;
                }

                if (unlockedTricksCount >= 5 &&
                    BadgesCatalog.TryUnlockBadge(progress, BadgesCatalog.ParkExplorer, out var explorerXp))
                {
                    bonusFromBadges += explorerXp;
                }

                if (unlockedTricksCount >= 10 &&
                    BadgesCatalog.TryUnlockBadge(progress, BadgesCatalog.ParkDominator, out var dominatorXp))
                {
                    bonusFromBadges += dominatorXp;
                }

                // ---------- 4) Badges horaires (Early Bird / Midnight Session) ----------
                var now = DateTime.UtcNow;
                var hour = now.Hour;

                // 6h–9h
                if (hour >= 6 && hour < 9 &&
                    BadgesCatalog.TryUnlockBadge(progress, BadgesCatalog.EarlyBird, out var earlyXp))
                {
                    bonusFromBadges += earlyXp;
                }

                // 22h–2h
                if ((hour >= 22 || hour < 2) &&
                    BadgesCatalog.TryUnlockBadge(progress, BadgesCatalog.MidnightSession, out var midnightXp))
                {
                    bonusFromBadges += midnightXp;
                }

                // ---------- 5) Badges d'avatars shape ----------
                // 🔁 ICI on utilise bien UnlockedShapeAvatarIds (celle qui existe dans ton UserProgress)
                var unlockedShapeCount = progress.UnlockedShapeAvatarIds?.Count ?? 0;

                if (unlockedShapeCount >= 5 &&
                    BadgesCatalog.TryUnlockBadge(progress, BadgesCatalog.AvatarCollector, out var avatarCollectorXp))
                {
                    bonusFromBadges += avatarCollectorXp;
                }

                if (unlockedShapeCount >= 10 &&
                    BadgesCatalog.TryUnlockBadge(progress, BadgesCatalog.UltimateCollector, out var ultimateCollectorXp))
                {
                    bonusFromBadges += ultimateCollectorXp;
                }

                // ---------- 6) Badges de streak (DailyStreak déjà maj ailleurs) ----------
                if (progress.DailyStreak >= 3 &&
                    BadgesCatalog.TryUnlockBadge(progress, BadgesCatalog.StreakRider, out var streakRiderXp))
                {
                    bonusFromBadges += streakRiderXp;
                }

                if (progress.DailyStreak >= 5 &&
                    BadgesCatalog.TryUnlockBadge(progress, BadgesCatalog.StreakDestroyer, out var streakDestroyerXp))
                {
                    bonusFromBadges += streakDestroyerXp;
                }

                if (progress.DailyStreak >= 10 &&
                    BadgesCatalog.TryUnlockBadge(progress, BadgesCatalog.StreakLegend, out var streakLegendXp))
                {
                    bonusFromBadges += streakLegendXp;
                }

                // ---------- Application du bonus XP éventuel ----------
                if (bonusFromBadges > 0)
                {
                    progress.XP += bonusFromBadges;
                    progress.XpGainedToday += bonusFromBadges;
                }

                await _progressRepo.SaveAsync(progress, ct);

                _logger.LogInformation(
                    "AddXPUseCase: user {UserId} +{BaseXP} XP (+{BonusXP} via badges). Total XP = {TotalXP}",
                    userId, amount, bonusFromBadges, progress.XP
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "AddXPUseCase: erreur lors de l'ajout de {Amount} XP à user {UserId}.",
                    amount, userId);
                throw;
            }
        }
    }
}
