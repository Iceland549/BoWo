namespace ContentMicroservice.Application.DTOs
{
    public class QuizDto
    {
        public string Id { get; set; } = null!;
        public string TrickId { get; set; } = null!;
        public string Question { get; set; } = null!;
        public IList<string> Answers { get; set; } = new List<string>();
        public string? Difficulty { get; set; }
        // Note: we never expose CorrectAnswerIndex here when returning to client

    }
}
