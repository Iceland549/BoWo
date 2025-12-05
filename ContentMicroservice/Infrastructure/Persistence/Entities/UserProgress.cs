using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ContentMicroservice.Infrastructure.Persistence.Entities
{
    public class UserProgress
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string UserId { get; set; } = null!;

        public List<string> UnlockedTricks { get; set; } = new();

        public DateTime LastUnlockDateUtc { get; set; } = DateTime.MinValue;

        public int TricksUnlockedToday { get; set; } = 0;

        /// <summary>
        /// Per-trick attempt counts (persisted).
        /// Key: trickId, Value: attempts count
        /// </summary>
        public Dictionary<string, int> QuizAttempts { get; set; } = new();

        // --------------- NOUVEAU : SYSTÈME XP & MINI-JEUX ---------------

        /// <summary>
        /// XP global de l'utilisateur (toutes actions confondues).
        /// </summary>
        public int XP { get; set; }

        /// <summary>
        /// Dernière activité significative (lecture, vidéo, quiz, etc.).
        /// Optionnel, utile pour des stats ou claims plus tard.
        /// </summary>
        public DateTime? LastActivityDateUtc { get; set; }

        /// <summary>
        /// Liste des mini-jeux débloqués (ex: "coin_flip", "dice", "spinner").
        /// </summary>
        public List<string> UnlockedMiniGames { get; set; } = new();

        /// <summary>
        /// Streak de jours consécutifs d'activité (BoWo Daily Streak).
        /// </summary>
        public int DailyStreak { get; set; }

        // --------------- AVATARS BUBBLE + FORME ---------------

        /// <summary>
        /// Avatar "bulle" choisi par l'utilisateur (portrait rond).
        /// Ne peut être choisi qu'à partir du niveau 2, et une seule fois.
        /// </summary>
        public string? BubbleAvatarId { get; set; }

        /// <summary>
        /// Avatar "forme skateur" actuellement affiché (sticker).
        /// Correspond en général au dernier avatar de forme débloqué.
        /// </summary>
        public string? ShapeAvatarId { get; set; }

        /// <summary>
        /// Historique des avatars "forme skateur" débloqués au fil des niveaux.
        /// Exemple : level >= 3 → shape_lvl03, level >= 4 → shape_lvl04, etc.
        /// </summary>
        public List<string> UnlockedShapeAvatarIds { get; set; } = new();

    }
}
