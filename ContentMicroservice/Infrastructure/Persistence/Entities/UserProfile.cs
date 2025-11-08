using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ContentMicroservice.Infrastructure.Persistence.Entities
{
    public class UserProfile
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        public string UserId { get; set; } = null!; // reference to Auth user id
        public string? DisplayName { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
