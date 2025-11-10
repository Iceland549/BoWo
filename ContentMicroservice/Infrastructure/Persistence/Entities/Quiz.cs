using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ContentMicroservice.Infrastructure.Persistence.Entities
{
    public class Quiz
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [BsonElement("trickId")]
        public string TrickId { get; set; } = null!;
        public string Question { get; set; } = null!;
        public List<string> Answers { get; set; } = new();
        public int CorrectAnswerIndex { get; set; }
        public string Difficulty { get; set; } = "easy";
    }
}
