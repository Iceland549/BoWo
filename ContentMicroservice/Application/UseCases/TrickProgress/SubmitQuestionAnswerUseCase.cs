using System;
using System.Linq;
using System.Threading.Tasks;
using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Application.Questions;
using ContentMicroservice.Infrastructure.Persistence.Entities;
using ContentMicroservice.Application.UseCases.UserProgress;   // <-- pour AddXPUseCase & GetUserProgressUseCase
using ContentMicroservice.Application.DTOs;                    // <-- pour UserProgressDto

namespace ContentMicroservice.Application.UseCases.TrickProgress
{
    public class SubmitAnswerRequest
    {
        public int Level { get; set; }
        public string UserAnswer { get; set; } = default!;
    }

    public class SubmitQuestionAnswerResponse
    {
        public bool Correct { get; set; }
        public int NewLevel { get; set; }
        public int XpGained { get; set; }
        public UserProgressDto GlobalProgress { get; set; } = default!;
    }

    public class SubmitQuestionAnswerUseCase
    {
        private readonly IUserTrickProgressRepository _progressRepo;
        private readonly IQuestionBank _questionBank;

        private readonly AddXPUseCase _addXPUseCase;                 // <-- ajouté
        private readonly GetUserProgressUseCase _getProgressUseCase; // <-- ajouté

        public SubmitQuestionAnswerUseCase(
            IUserTrickProgressRepository progressRepo,
            IQuestionBank questionBank,
            AddXPUseCase addXPUseCase,                  // <-- injecté
            GetUserProgressUseCase getProgressUseCase   // <-- injecté
        )
        {
            _progressRepo = progressRepo;
            _questionBank = questionBank;
            _addXPUseCase = addXPUseCase;
            _getProgressUseCase = getProgressUseCase;
        }

        public async Task<SubmitQuestionAnswerResponse> ExecuteAsync(
            string userId,
            string trickId,
            SubmitAnswerRequest request)
        {
            if (request.Level < 1 || request.Level > 8)
                throw new ArgumentOutOfRangeException(nameof(request.Level), "Level must be between 1 and 8.");

            // Récupération de la question
            var set = _questionBank.GetQuestionsForTrick(trickId);
            var question = set.Questions.FirstOrDefault(q => q.Level == request.Level);

            if (question == null)
                throw new InvalidOperationException($"No question found for trick={trickId}, level={request.Level}.");

            // Comparaison simple
            var correct = string.Equals(
                question.Answer?.Trim(),
                request.UserAnswer?.Trim(),
                StringComparison.OrdinalIgnoreCase);

            // Récupération progression locale
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

            int newLevel = progress.Level;
            int XpGained = 0;

            if (correct)
            {
                if (request.Level == progress.Level + 1 && progress.Level < 8)
                {
                    newLevel = progress.Level + 1;

                    // XP local conservé (utile pour UI locale)
                    XpGained = 20;
                }
            }

            // Mise à jour progression locale
            progress.Level = newLevel;
            progress.LastQuestionAt = DateTime.UtcNow;
            await _progressRepo.UpdateAsync(progress);

            // ---------------------------
            // 🔥 NOUVEAU : XP GLOBAL
            // ---------------------------
            if (correct)
            {
                await _addXPUseCase.ExecuteAsync(userId, 20); // <-- +20 XP global
            }

            // ---------------------------
            // 🔥 NOUVEAU : récupérer UserProgressDto
            // ---------------------------
            var globalProgress = await _getProgressUseCase.ExecuteAsync(userId);

            // Retour unifié
            return new SubmitQuestionAnswerResponse
            {
                Correct = correct,
                NewLevel = newLevel,
                XpGained = XpGained,
                GlobalProgress = globalProgress
            };
        }
    }
}
