namespace ContentMicroservice.Application.DTOs
{
    public class UserProgressDto
    {
        public string UserId { get; set; } = null!;
        public IList<string> UnlockedTricks { get; set; } = new List<string>();
        public DateTime LastUnlockDateUtc { get; set; }
        public int TricksUnlockedToday { get; set; }
        public IDictionary<string, int> QuizAttempts { get; set; } = new Dictionary<string, int>();
        public int TotalUnlocked => UnlockedTricks?.Count ?? 0;

        // --- NOUVEAU : SYSTÈME XP / LEVEL / COMPLETION ---

        /// <summary>
        /// XP global cumulé de l'utilisateur.
        /// </summary>
        public int XP { get; set; }

        /// <summary>
        /// Niveau dérivé de l'XP (XP_PER_LEVEL côté use case).
        /// </summary>
        public int Level { get; set; }

        /// <summary>
        /// Nombre total de tricks disponibles dans le catalogue.
        /// </summary>
        public int TotalTricksAvailable { get; set; }

        /// <summary>
        /// Pourcentage de complétion globale (0–100).
        /// </summary>
        public int CompletionPercent { get; set; }

        /// <summary>
        /// Mini-jeux débloqués (ex: "coin_flip", "dice", "spinner").
        /// </summary>
        public List<string> UnlockedMiniGames { get; set; } = new();
    }
}
