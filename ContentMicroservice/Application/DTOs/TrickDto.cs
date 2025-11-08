namespace ContentMicroservice.Application.DTOs
{
    public class TrickDto
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Difficulty { get; set; }
        public string? VideoUrl { get; set; }
        public IList<string> Tags { get; set; } = new List<string>();
        public string? AuthorId { get; set; }
        public DateTime CreatedAt { get; set; }

    }
}
