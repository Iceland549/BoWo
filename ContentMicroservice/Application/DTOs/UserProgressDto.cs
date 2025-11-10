namespace ContentMicroservice.Application.DTOs
{
    public class UserProgressDto
    {
        public string UserId { get; set; } = null!;
        public IList<string> UnlockedTricks { get; set; } = new List<string>();
        public DateTime LastUnlockDateUtc { get; set; }
        public int TricksUnlockedToday { get; set; }
        public IDictionary<string, int> QuizAttempts { get; set; } = new Dictionary<string, int>();
        public int TotalUnlocked => UnlockedTricks?.Count ?? 0;

    }
}
