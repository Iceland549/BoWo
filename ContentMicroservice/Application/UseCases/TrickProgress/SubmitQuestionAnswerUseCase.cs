using System;
using System.Linq;
using System.Threading.Tasks;
using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Application.Questions;
using ContentMicroservice.Infrastructure.Persistence.Entities;

namespace ContentMicroservice.Application.UseCases.TrickProgress
{
    public class SubmitAnswerRequest
    {
        public int Level { get; set; }
        public string UserAnswer { get; set; } = default!;
    }

    public class SubmitAnswerResult
    {
        public bool Correct { get; set; }
        public int NewLevel { get; set; }
        public int XpGained { get; set; }
    }

    public class SubmitQuestionAnswerUseCase
    {
        private readonly IUserTrickProgressRepository _progressRepo;
        private readonly IQuestionBank _questionBank;

        public SubmitQuestionAnswerUseCase(
            IUserTrickProgressRepository progressRepo,
            IQuestionBank questionBank)
        {
            _progressRepo = progressRepo;
            _questionBank = questionBank;
        }

        public async Task<SubmitAnswerResult> ExecuteAsync(
            string userId,
            string trickId,
            SubmitAnswerRequest request)
        {
            if (request.Level < 1 || request.Level > 8)
                throw new ArgumentOutOfRangeException(nameof(request.Level), "Level must be between 1 and 8.");

            var set = _questionBank.GetQuestionsForTrick(trickId);

            var question = set.Questions.FirstOrDefault(q => q.Level == request.Level);
            if (question == null)
                throw new InvalidOperationException($"No question found for trick={trickId}, level={request.Level}.");

            // Comparaison simple, case-insensitive, trim
            var correct = string.Equals(
                question.Answer?.Trim(),
                request.UserAnswer?.Trim(),
                StringComparison.OrdinalIgnoreCase);

            var progress = await _progressRepo.GetAsync(userId, trickId);
            if (progress == null)
            {
                progress = new UserTrickProgress
                {
                    UserId = userId,
                    TrickId = trickId,
                    Level = 0
                };
                await _progressRepo.CreateAsync(progress);
            }

            var newLevel = progress.Level;

            int xpGained = 0;
            if (correct)
            {
                // On ne baisse jamais le level, on l'augmente jusqu'à 8 max.
                if (request.Level == progress.Level + 1 && progress.Level < 8)
                {
                    newLevel = progress.Level + 1;

                    // Règle XP simple : 1-4:10XP, 5-7:15XP, 8:25XP
                    xpGained = request.Level switch
                    {
                        <= 4 => 10,
                        <= 7 => 15,
                        _ => 25
                    };
                }
            }

            progress.Level = newLevel;
            progress.LastQuestionAt = DateTime.UtcNow;
            await _progressRepo.UpdateAsync(progress);

            return new SubmitAnswerResult
            {
                Correct = correct,
                NewLevel = newLevel,
                XpGained = xpGained
            };
        }
    }
}
