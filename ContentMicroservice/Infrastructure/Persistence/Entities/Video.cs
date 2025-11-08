using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ContentMicroservice.Infrastructure.Persistence.Entities
{
    public class Video
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        public string Url { get; set; } = null!;
        public string Filename { get; set; } = null!;
        public string? UploaderId { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;


    }
}
