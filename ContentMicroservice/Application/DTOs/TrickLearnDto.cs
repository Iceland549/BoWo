namespace ContentMicroservice.Application.DTOs
{
    public class TrickLearnDto
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }

        // étapes textuelles (tu les remplis via tes JSON)
        public IList<string> Steps { get; set; } = new List<string>();

        // URLs d’images pédagogiques (tu les remplis via tes JSON)
        public IList<string> Images { get; set; } = new List<string>();

        // URLs vidéo déjà stockées dans Trick.Videos
        public string? AmateurVideoUrl { get; set; }
        public string? ProVideoUrl { get; set; }

    }
}
