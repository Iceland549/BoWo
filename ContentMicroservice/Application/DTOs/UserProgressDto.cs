using System;
using System.Collections.Generic;

namespace ContentMicroservice.Application.DTOs
{
    public class UserProgressDto
    {
        public string UserId { get; set; } = string.Empty;

        public IList<string> UnlockedTricks { get; set; } = new List<string>();
        public DateTime LastUnlockDateUtc { get; set; }
        public int TricksUnlockedToday { get; set; }
        public IDictionary<string, int> QuizAttempts { get; set; } = new Dictionary<string, int>();

        /// <summary>
        /// Nombre total de tricks effectivement débloqués.
        /// </summary>
        public int TotalUnlocked => UnlockedTricks?.Count ?? 0;

        // --- SYSTÈME XP / LEVEL / COMPLETION ---

        /// <summary>
        /// XP global cumulé de l'utilisateur (toutes sources confondues).
        /// </summary>
        public int XP { get; set; }

        /// <summary>
        /// Niveau global (1..MaxDefinedLevel) dérivé de l'XP.
        /// </summary>
        public int Level { get; set; }

        /// <summary>
        /// Nom / titre du niveau (ex: "Urban Myth").
        /// </summary>
        public string LevelTitle { get; set; } = string.Empty;

        /// <summary>
        /// Emoji associé au niveau (ex: "💎").
        /// </summary>
        public string LevelEmoji { get; set; } = string.Empty;

        /// <summary>
        /// XP minimum requis pour atteindre ce niveau.
        /// </summary>
        public int CurrentLevelMinXP { get; set; }

        /// <summary>
        /// XP minimum requis pour atteindre le niveau suivant.
        /// Identique à CurrentLevelMinXP si on est déjà au niveau max.
        /// </summary>
        public int NextLevelMinXP { get; set; }

        /// <summary>
        /// XP restant avant le prochain niveau (0 si niveau max).
        /// </summary>
        public int XPToNextLevel { get; set; }

        /// <summary>
        /// Niveau maximum défini dans le barème actuel (ex: 20).
        /// </summary>
        public int MaxDefinedLevel { get; set; }

        /// <summary>
        /// Indique si l'utilisateur est déjà au niveau maximum.
        /// </summary>
        public bool IsMaxLevel => Level >= MaxDefinedLevel;

        /// <summary>
        /// Nombre total de tricks disponibles dans le catalogue.
        /// </summary>
        public int TotalTricksAvailable { get; set; }

        /// <summary>
        /// Pourcentage de complétion globale (0–100).
        /// </summary>
        public int CompletionPercent { get; set; }

        /// <summary>
        /// Mini-jeux débloqués (ex: "coin-flip", "dice", "spinner").
        /// </summary>
        public List<string> UnlockedMiniGames { get; set; } = new();

        /// <summary>
        /// Streak de jours consécutifs d'activité (BoWo Daily Streak).
        /// </summary>
        public int DailyStreak { get; set; }

        // ------------------- BADGES + DECKS + COMPTEURS -------------------
        /// <summary>
        /// Liste des badges débloqués (ids textuels ex: "badge_kickstart", "badge_xp_hunter").
        /// </summary>
        public List<string> UnlockedBadges { get; set; } = new();

        /// <summary>
        /// Decks gagnés via tricks Mastered (ex: "deck_rust_riot", "deck_neon_pulse").
        /// </summary>
        public List<string> UnlockedDecks { get; set; } = new();

        /// <summary>
        /// Decks spéciaux "Alive" débloqués pour l'utilisateur.
        /// Utilisé par AliveDecksScreen pour afficher les decks animés.
        /// </summary>
        public List<string> UnlockedAliveDecks { get; set; } = new();

        /// <summary>
        /// Nombre de "tokens Alive" disponibles (XP/1000 - decks déjà débloqués)
        /// </summary>
        public int AliveDeckTokens { get; set; }

        /// <summary>
        /// Tricks déjà Mastered (pour éviter plusieurs decks sur le même trick).
        /// </summary>
        public List<string> MasteredTricks { get; set; } = new();

        /// <summary>
        /// Nombre de questions (bonnes réponses) aujourd'hui (pour Quick Thinker / Trick Machine).
        /// </summary>
        public int QuestionsAnsweredToday { get; set; }

        /// <summary>
        /// XP gagnée aujourd'hui (pour XP Hunter).
        /// </summary>
        public int XpGainedToday { get; set; }

        // ----------- AVATARS (EXPOSÉ AU FRONT) -----------

        /// <summary>
        /// Avatar bulle actuellement choisi (peut être null si pas encore choisi).
        /// </summary>
        public string? BubbleAvatarId { get; set; }

        /// <summary>
        /// Avatar "forme skateur" actuellement utilisé.
        /// </summary>
        public string? ShapeAvatarId { get; set; }

        /// <summary>
        /// Avatars bulle disponibles pour la sélection.
        /// Non vide uniquement si Level >= 2 ET BubbleAvatarId == null.
        /// </summary>
        public List<string> AvailableBubbleAvatarIds { get; set; } = new();

        /// <summary>
        /// Avatars "forme skateur" débloqués (historique).
        /// Pour que le front puisse afficher une collection / timeline.
        /// </summary>
        public List<string> AvailableShapeAvatarIds { get; set; } = new();
    }
}
