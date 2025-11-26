namespace ContentMicroservice.Application.Questions
{
    public class TrickQuestionSet
    {
        public string Trick { get; set; } = default!;
        public List<QuestionDefinition> Questions { get; set; } = new();
    }

    public class QuestionDefinition
    {
        public int Level { get; set; }
        public string Type { get; set; } = default!;
        public string Question { get; set; } = default!;
        public List<string> Options { get; set; } = new();
        public string Answer { get; set; } = default!;
    }

}
