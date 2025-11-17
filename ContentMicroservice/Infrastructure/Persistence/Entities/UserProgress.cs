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
    }
}
