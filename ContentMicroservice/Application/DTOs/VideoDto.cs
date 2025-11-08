namespace ContentMicroservice.Application.DTOs
{
    public class VideoDto
    {
        public string Id { get; set; } = null!;
        public string Url { get; set; } = null!;
        public string Filename { get; set; } = null!;
        public string? UploaderId { get; set; }
        public DateTime UploadedAt { get; set; }

    }
}
