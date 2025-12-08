using System.Collections.Generic;
using ProgressEntity = ContentMicroservice.Infrastructure.Persistence.Entities.UserProgress;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    internal sealed class BadgeDef
    {
        public string Id { get; init; } = string.Empty;
        public string Title { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
        public int XpReward { get; init; }
    }

    /// <summary>
    /// Catalogue central de tous les badges (+ XP qu'ils donnent).
    /// </summary>
    internal static class BadgesCatalog
    {
        // Ids alignés avec ta liste de 20 badges
        public const string Kickstart = "badge_kickstart";
        public const string QuickThinker = "badge_quick_thinker";
        public const string TrickMachine = "badge_trick_machine";
        public const string FullSend = "badge_full_send";
        public const string CommitOrQuit = "badge_commit_or_quit";
        public const string PerfectTrick = "badge_perfect_trick";
        public const string DoubleMaster = "badge_double_master";
        public const string TripleThreat = "badge_triple_threat";
        public const string Perfectionist = "badge_perfectionist";
        public const string StreakRider = "badge_streak_rider";
        public const string StreakDestroyer = "badge_streak_destroyer";
        public const string StreakLegend = "badge_streak_legend";
        public const string QuizMaster = "badge_quiz_master";
        public const string XpHunter = "badge_xp_hunter";
        public const string ParkExplorer = "badge_park_explorer";
        public const string ParkDominator = "badge_park_dominator";
        public const string AvatarCollector = "badge_avatar_collector";
        public const string UltimateCollector = "badge_ultimate_collector";
        public const string EarlyBird = "badge_early_bird";
        public const string MidnightSession = "badge_midnight_session";

        private static readonly Dictionary<string, BadgeDef> BADGES = new()
        {
            { Kickstart, new BadgeDef {
                Id = Kickstart,
                Title = "Kickstart Rookie",
                Description = "Ton premier trick débloqué !",
                XpReward = 20
            }},
            { QuickThinker, new BadgeDef {
                Id = QuickThinker,
                Title = "Quick Thinker",
                Description = "Répondre à 5 questions d’affilée sans erreur (simplifié : 5 bonnes réponses dans la journée).",
                XpReward = 20
            }},
            { TrickMachine, new BadgeDef {
                Id = TrickMachine,
                Title = "Trick Machine",
                Description = "Répondre à 20 questions en 1 journée.",
                XpReward = 30
            }},
            { FullSend, new BadgeDef {
                Id = FullSend,
                Title = "Full Send",
                Description = "Essayer un trick 10 fois d’affilée (10 tentatives ratées enregistrées).",
                XpReward = 20
            }},
            { CommitOrQuit, new BadgeDef {
                Id = CommitOrQuit,
                Title = "Commit or Quit",
                Description = "Ne jamais lâcher jusqu’au premier trick Mastered.",
                XpReward = 20
            }},
            { PerfectTrick, new BadgeDef {
                Id = PerfectTrick,
                Title = "Perfect Trick",
                Description = "Obtenir 8/8 à un trick (premier trick Mastered).",
                XpReward = 30
            }},
            { DoubleMaster, new BadgeDef {
                Id = DoubleMaster,
                Title = "Double Master",
                Description = "Mastered deux tricks.",
                XpReward = 20
            }},
            { TripleThreat, new BadgeDef {
                Id = TripleThreat,
                Title = "Triple Threat",
                Description = "Mastered trois tricks.",
                XpReward = 30
            }},
            { Perfectionist, new BadgeDef {
                Id = Perfectionist,
                Title = "The Perfectionist",
                Description = "Obtenir trois tricks Mastered (interprétation : 3 perfects).",
                XpReward = 40
            }},
            { StreakRider, new BadgeDef {
                Id = StreakRider,
                Title = "Streak Rider",
                Description = "Streak de 3 jours.",
                XpReward = 20
            }},
            { StreakDestroyer, new BadgeDef {
                Id = StreakDestroyer,
                Title = "Streak Destroyer",
                Description = "Streak de 5 jours.",
                XpReward = 30
            }},
            { StreakLegend, new BadgeDef {
                Id = StreakLegend,
                Title = "Streak Legend",
                Description = "Streak de 10 jours.",
                XpReward = 40
            }},
            { QuizMaster, new BadgeDef {
                Id = QuizMaster,
                Title = "Quiz Master",
                Description = "Réussir 5 tricks Mastered (5 quiz full).",
                XpReward = 30
            }},
            { XpHunter, new BadgeDef {
                Id = XpHunter,
                Title = "XP Hunter",
                Description = "Gagner 500 XP en une seule journée.",
                XpReward = 40
            }},
            { ParkExplorer, new BadgeDef {
                Id = ParkExplorer,
                Title = "Park Explorer",
                Description = "Débloquer 5 tricks.",
                XpReward = 20
            }},
            { ParkDominator, new BadgeDef {
                Id = ParkDominator,
                Title = "Park Dominator",
                Description = "Débloquer 10 tricks.",
                XpReward = 30
            }},
            { AvatarCollector, new BadgeDef {
                Id = AvatarCollector,
                Title = "Avatar Collector",
                Description = "Débloquer 5 avatars shape.",
                XpReward = 20
            }},
            { UltimateCollector, new BadgeDef {
                Id = UltimateCollector,
                Title = "Ultimate Collector",
                Description = "Débloquer 10 avatars shape.",
                XpReward = 40
            }},
            { EarlyBird, new BadgeDef {
                Id = EarlyBird,
                Title = "Early Bird Skater",
                Description = "Jouer entre 6h et 9h.",
                XpReward = 20
            }},
            { MidnightSession, new BadgeDef {
                Id = MidnightSession,
                Title = "Midnight Session",
                Description = "Jouer entre 22h et 02h.",
                XpReward = 20
            }},
        };

        /// <summary>
        /// Essaie d'ajouter un badge à l'utilisateur. Retourne true si le badge
        /// vient d'être débloqué + le bonus XP associé.
        /// </summary>
        public static bool TryUnlockBadge(ProgressEntity progress, string badgeId, out int xpReward)
        {
            xpReward = 0;

            if (progress.UnlockedBadges == null)
            {
                progress.UnlockedBadges = new List<string>();
            }

            if (progress.UnlockedBadges.Contains(badgeId))
            {
                return false;
            }

            if (!BADGES.TryGetValue(badgeId, out var def))
            {
                return false;
            }

            progress.UnlockedBadges.Add(badgeId);
            xpReward = def.XpReward;
            return true;
        }
    }
}
