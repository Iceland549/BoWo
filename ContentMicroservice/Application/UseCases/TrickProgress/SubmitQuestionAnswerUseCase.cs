using System;
using System.Linq;
using System.Threading.Tasks;
using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Application.Questions;
using ContentMicroservice.Infrastructure.Persistence.Entities;
using ContentMicroservice.Application.UseCases.UserProgress;   // AddXPUseCase, GetUserProgressUseCase, DeckCatalog, BadgesCatalog
using ContentMicroservice.Application.DTOs;                    // UserProgressDto
using Microsoft.Extensions.Logging;
using GlobalProgress = ContentMicroservice.Infrastructure.Persistence.Entities.UserProgress;

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

        private readonly AddXPUseCase _addXPUseCase;
        private readonly GetUserProgressUseCase _getProgressUseCase;

        private readonly IUserProgressRepository _userProgressRepo;
        private readonly ILogger<SubmitQuestionAnswerUseCase> _logger;

        public SubmitQuestionAnswerUseCase(
            IUserTrickProgressRepository progressRepo,
            IQuestionBank questionBank,
            AddXPUseCase addXPUseCase,
            GetUserProgressUseCase getProgressUseCase,
            IUserProgressRepository userProgressRepo,
            ILogger<SubmitQuestionAnswerUseCase> logger
        )
        {
            _progressRepo = progressRepo;
            _questionBank = questionBank;
            _addXPUseCase = addXPUseCase;
            _getProgressUseCase = getProgressUseCase;
            _userProgressRepo = userProgressRepo;
            _logger = logger;
        }

        public async Task<SubmitQuestionAnswerResponse> ExecuteAsync(
            string userId,
            string trickId,
            SubmitAnswerRequest request)
        {
            if (request.Level < 1 || request.Level > 8)
                throw new ArgumentOutOfRangeException(nameof(request.Level), "Level must be between 1 and 8.");

            // 1) Récupérer la question
            var set = _questionBank.GetQuestionsForTrick(trickId);
            var question = set.Questions.FirstOrDefault(q => q.Level == request.Level);

            if (question == null)
                throw new InvalidOperationException($"No question found for trick={trickId}, level={request.Level}.");

            // 2) Comparaison de la réponse
            var correct = string.Equals(
                question.Answer?.Trim(),
                request.UserAnswer?.Trim(),
                StringComparison.OrdinalIgnoreCase);

            // 3) Progression locale du trick
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
            int xpGained = 0;

            if (correct)
            {
                // on ne progresse que si on répond dans l'ordre 1→2→3...
                if (request.Level == progress.Level + 1 && progress.Level < 8)
                {
                    newLevel = progress.Level + 1;
                    xpGained = 20; // XP locale (UI)
                }
            }

            bool trickJustMastered = progress.Level < 8 && newLevel >= 8;

            // 4) Mise à jour de la progression locale
            progress.Level = newLevel;
            progress.LastQuestionAt = DateTime.UtcNow;
            await _progressRepo.UpdateAsync(progress);

            // 5) XP globale (XP de base pour la bonne réponse)
            if (correct && xpGained > 0)
            {
                await _addXPUseCase.ExecuteAsync(userId, xpGained);
            }

            // 6) LOGIQUE MASTERED → 1 Deck + Badges de mastery
            if (trickJustMastered)
            {
                try
                {
                    var userProgress = await _userProgressRepo.GetByUserIdAsync(userId)
                                       ?? new GlobalProgress { UserId = userId };

                    userProgress.MasteredTricks ??= new System.Collections.Generic.List<string>();
                    userProgress.UnlockedDecks ??= new System.Collections.Generic.List<string>();
                    userProgress.UnlockedBadges ??= new System.Collections.Generic.List<string>();

                    if (!userProgress.MasteredTricks.Contains(trickId))
                    {
                        userProgress.MasteredTricks.Add(trickId);

                        // 🎴 1) Deck tiré dans le pool "skill decks"
                        var newDeckId = DeckCatalog.GetRandomNewDeckId(userProgress.UnlockedDecks);
                        if (!string.IsNullOrEmpty(newDeckId) &&
                            !userProgress.UnlockedDecks.Contains(newDeckId))
                        {
                            userProgress.UnlockedDecks.Add(newDeckId);
                        }

                        // 🎖 2) Badges de mastery
                        int masteredCount = userProgress.MasteredTricks.Count;
                        int bonusFromBadges = 0;

                        // Premier trick perfect → PerfectTrick + CommitOrQuit
                        if (masteredCount >= 1)
                        {
                            if (BadgesCatalog.TryUnlockBadge(userProgress, BadgesCatalog.PerfectTrick, out var perfectXp))
                                bonusFromBadges += perfectXp;

                            if (BadgesCatalog.TryUnlockBadge(userProgress, BadgesCatalog.CommitOrQuit, out var commitXp))
                                bonusFromBadges += commitXp;
                        }

                        // 2 tricks Mastered → DoubleMaster
                        if (masteredCount >= 2 &&
                            BadgesCatalog.TryUnlockBadge(userProgress, BadgesCatalog.DoubleMaster, out var doubleXp))
                        {
                            bonusFromBadges += doubleXp;
                        }

                        // 3 tricks Mastered → TripleThreat + Perfectionist
                        if (masteredCount >= 3)
                        {
                            if (BadgesCatalog.TryUnlockBadge(userProgress, BadgesCatalog.TripleThreat, out var tripleXp))
                                bonusFromBadges += tripleXp;

                            if (BadgesCatalog.TryUnlockBadge(userProgress, BadgesCatalog.Perfectionist, out var perfectionistXp))
                                bonusFromBadges += perfectionistXp;
                        }

                        // 5 tricks Mastered → QuizMaster
                        if (masteredCount >= 5 &&
                            BadgesCatalog.TryUnlockBadge(userProgress, BadgesCatalog.QuizMaster, out var quizMasterXp))
                        {
                            bonusFromBadges += quizMasterXp;
                        }

                        await _userProgressRepo.SaveAsync(userProgress);

                        // Appliquer l'XP bonus des badges de mastery
                        if (bonusFromBadges > 0)
                        {
                            await _addXPUseCase.ExecuteAsync(userId, bonusFromBadges);
                        }

                        _logger.LogInformation(
                            "User {UserId} mastered trick {TrickId} → deck {DeckId}, masteredCount={Count}, bonusFromBadges={Bonus}",
                            userId, trickId, newDeckId, masteredCount, bonusFromBadges
                        );
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Error while processing mastered trick rewards for user {UserId} / trick {TrickId}",
                        userId, trickId
                    );
                    // On ne casse pas la réponse même si la récompense plante.
                }
            }

            // 7) Progression globale à jour pour le front
            var globalProgress = await _getProgressUseCase.ExecuteAsync(userId);

            return new SubmitQuestionAnswerResponse
            {
                Correct = correct,
                NewLevel = newLevel,
                XpGained = xpGained,
                GlobalProgress = globalProgress
            };
        }
    }
}
