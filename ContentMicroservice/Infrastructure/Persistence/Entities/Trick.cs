using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ContentMicroservice.Infrastructure.Persistence.Entities
{
    public class Trick
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Difficulty { get; set; }
        public string? VideoUrl { get; set; }
        public List<string> Tags { get; set; } = new List<string>();
        public string? AuthorId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}
