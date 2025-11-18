using ContentMicroservice.Application.DTOs;
using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Application.UseCases.UserProgress;
using Microsoft.Extensions.Logging;

namespace ContentMicroservice.Application.UseCases.Quiz
{
    /// <summary>
    /// Valide une réponse de quiz, déclenche le déverrouillage
    /// et renvoie des infos utiles (dont le FunFact après X échecs).
    /// </summary>
    public class ValidateQuizUseCase
    {
        private readonly IQuizRepository _quizRepo;
        private readonly RecordQuizAttemptUseCase _recordAttempt;
        private readonly UnlockTrickUseCase _unlockUseCase;
        private readonly IContentRepository _contentRepo;
        private readonly ILogger<ValidateQuizUseCase> _logger;
        private readonly int _maxAttempts;

        public ValidateQuizUseCase(
            IQuizRepository quizRepo,
            RecordQuizAttemptUseCase recordAttempt,
            UnlockTrickUseCase unlockUseCase,
            IContentRepository contentRepo,
            ILogger<ValidateQuizUseCase> logger,
            int maxAttempts = 3)
        {
            _quizRepo = quizRepo;
            _recordAttempt = recordAttempt;
            _unlockUseCase = unlockUseCase;
            _contentRepo = contentRepo;
            _logger = logger;
            _maxAttempts = maxAttempts;
        }

        public async Task<QuizValidationResponseDto> ExecuteAsync(
            string userId,
            string trickId,
            int answerIndex,
            CancellationToken ct = default)
        {
            try
            {
                _logger.LogDebug(
                    "User {UserId} validating quiz for trick {TrickId} with answer {AnswerIndex}",
                    userId, trickId, answerIndex);

                // 1) Charger le quiz
                var quiz = await _quizRepo.GetByTrickIdAsync(trickId, ct);
                if (quiz == null)
                {
                    _logger.LogWarning("Quiz not found for trick {TrickId}", trickId);
                    return new QuizValidationResponseDto
                    {
                        Success = false,
                        Message = "Quiz not found",
                        MaxAttemptsReached = false,
                        FunFact = string.Empty
                    };
                }

                // 2) Essayer de charger le FunFact lié au trick
                string? funFact = null;
                try
                {
                    var trick = await _contentRepo.GetTrickByIdAsync(trickId, ct);
                    funFact = trick?.FunFact;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Unable to load FunFact for trick {TrickId}", trickId);
                    // On continue sans FunFact, ce n'est pas bloquant
                }

                // 3) Bonne réponse → déverrouillage du trick
                if (answerIndex == quiz.CorrectAnswerIndex)
                {
                    _logger.LogInformation(
                        "User {UserId} answered correctly for trick {TrickId}",
                        userId, trickId);

                    var (ok, msg) = await _unlockUseCase.ExecuteAsync(userId, trickId, ct);

                    return new QuizValidationResponseDto
                    {
                        Success = ok,
                        Message = ok ? "Correct! Trick unlocked!" : msg,
                        MaxAttemptsReached = false,
                        FunFact = string.Empty // pas besoin de FunFact en cas de succès
                    };
                }

                // 4) Mauvaise réponse → on incrémente les tentatives
                var attempts = await _recordAttempt.ExecuteAsync(userId, trickId, ct);
                _logger.LogInformation(
                    "User {UserId} incorrect answer for trick {TrickId}. Attempts now {Attempts}",
                    userId, trickId, attempts);

                // 5) Si on a atteint (ou dépassé) le max → Fun Fact
                if (attempts >= _maxAttempts)
                {
                    _logger.LogInformation(
                        "User {UserId} reached max attempts for trick {TrickId}",
                        userId, trickId);

                    return new QuizValidationResponseDto
                    {
                        Success = false,
                        Message = "Max attempts reached",
                        MaxAttemptsReached = true,
                        FunFact = funFact ?? string.Empty
                    };
                }

                // 6) Erreur "normale" (1ère ou 2ème tentative)
                return new QuizValidationResponseDto
                {
                    Success = false,
                    Message = $"Wrong answer ({attempts}/{_maxAttempts})",
                    MaxAttemptsReached = false,
                    FunFact = string.Empty
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error validating quiz for user {UserId} trick {TrickId}",
                    userId, trickId);

                return new QuizValidationResponseDto
                {
                    Success = false,
                    Message = "Internal error",
                    MaxAttemptsReached = false,
                    FunFact = string.Empty
                };
            }
        }
    }
}
