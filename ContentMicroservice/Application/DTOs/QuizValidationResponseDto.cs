namespace ContentMicroservice.Application.DTOs
{
    public class QuizValidationResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public bool MaxAttemptsReached { get; set; }
        public string FunFact { get; set; } = null!;
    }
}
