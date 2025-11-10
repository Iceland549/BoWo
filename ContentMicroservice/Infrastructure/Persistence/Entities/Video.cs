using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ContentMicroservice.Infrastructure.Persistence.Entities
{
    /// <summary>
    /// Représente une vidéo liée à un trick (amateur, pro ou utilisateur).
    /// </summary>
    public class Video
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// Identifiant du trick associé à la vidéo.
        /// </summary>
        public string TrickId { get; set; } = null!;

        /// <summary>
        /// URL publique de la vidéo (Firebase, GCP, etc.).
        /// </summary>
        public string Url { get; set; } = null!;

        /// <summary>
        /// Nom du fichier source ou identifiant dans le storage.
        /// </summary>
        public string Filename { get; set; } = null!;

        /// <summary>
        /// Identifiant de l’utilisateur qui a uploadé la vidéo (peut être null pour les vidéos officielles).
        /// </summary>
        public string? UploaderId { get; set; }

        /// <summary>
        /// Type de vidéo : amateur, pro, user.
        /// </summary>
        public string Type { get; set; } = "amateur";

        /// <summary>
        /// Date de l’upload ou de l’import.
        /// </summary>
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}
