namespace ContentMicroservice.Application.DTOs
{
    public class TrickLearnDto
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public IList<string> Steps { get; set; } = new List<string>();
        public IList<string> Images { get; set; } = new List<string>();
        public string? AmateurVideoUrl { get; set; }
        public string? ProVideoUrl { get; set; }
        public List<string> ProTip { get; set; } = new();
        public List<string> CommonMistake { get; set; } = new();
        public string? FunFact { get; set; }


    }
}
