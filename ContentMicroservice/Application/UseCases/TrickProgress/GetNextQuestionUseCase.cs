using System.Linq;
using System.Threading.Tasks;
using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Application.Questions;
using ContentMicroservice.Infrastructure.Persistence.Entities;

namespace ContentMicroservice.Application.UseCases.TrickProgress
{
    public class GetNextQuestionResult
    {
        public int CurrentLevel { get; set; }
        public QuestionDefinition? Question { get; set; }
        public bool IsCompleted => Question == null;
    }

    public class GetNextQuestionUseCase
    {
        private readonly IUserTrickProgressRepository _progressRepo;
        private readonly IQuestionBank _questionBank;

        public GetNextQuestionUseCase(
            IUserTrickProgressRepository progressRepo,
            IQuestionBank questionBank)
        {
            _progressRepo = progressRepo;
            _questionBank = questionBank;
        }

        public async Task<GetNextQuestionResult> ExecuteAsync(string userId, string trickId)
        {
            var questionsSet = _questionBank.GetQuestionsForTrick(trickId);

            var progress = await _progressRepo.GetAsync(userId, trickId);
            var currentLevel = progress?.Level ?? 0;

            // Si déjà au niveau 8 => plus de question
            if (currentLevel >= 8)
            {
                return new GetNextQuestionResult
                {
                    CurrentLevel = currentLevel,
                    Question = null
                };
            }

            var nextLevel = currentLevel + 1;
            var question = questionsSet.Questions
                .FirstOrDefault(q => q.Level == nextLevel);

            return new GetNextQuestionResult
            {
                CurrentLevel = currentLevel,
                Question = question
            };
        }
    }
}
