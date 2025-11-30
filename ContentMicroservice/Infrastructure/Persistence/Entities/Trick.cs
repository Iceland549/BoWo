using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ContentMicroservice.Infrastructure.Persistence.Entities
{
    public class Trick
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string Name { get; set; } = null!;
        [BsonElement("difficulty")]
        public string Difficulty { get; set; } = "";
        public double Price { get; set; }
        public string Description { get; set; } = null!;
        public List<string> Steps { get; set; } = new();
        public List<string> Images { get; set; } = new();
        public TrickVideos Videos { get; set; } = new();
        public string? FunFact { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("proTip")]
        public List<string> ProTip { get; set; } = new();

        [BsonElement("commonMistake")]
        public List<string> CommonMistake { get; set; } = new();
    }

    public class TrickVideos
    {
        public string? AmateurUrl { get; set; }
        public string? ProUrl { get; set; }
    }
}
