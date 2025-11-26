namespace ContentMicroservice.Infrastructure.Persistence.Entities
{
    public class UserTrickProgress
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string UserId { get; set; } = default!;

        public string TrickId { get; set; } = default!;

        /// <summary>
        /// Niveau actuel atteint pour ce trick (0 à 8).
        /// 0 = aucune question encore validée.
        /// </summary>
        public int Level { get; set; } = 0;

        /// <summary>
        /// Dernière fois qu'une question a été posée / répondue.
        /// </summary>
        public DateTime LastQuestionAt { get; set; } = DateTime.UtcNow;


    }
}
