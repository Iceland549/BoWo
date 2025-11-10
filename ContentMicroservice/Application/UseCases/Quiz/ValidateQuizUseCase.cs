using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Application.UseCases.UserProgress;
using Microsoft.Extensions.Logging;

namespace ContentMicroservice.Application.UseCases.Quiz
{
    /// <summary>
    /// Validates a quiz answer and triggers unlock logic if correct.
    /// Also records attempts and returns useful messages.
    /// </summary>
    public class ValidateQuizUseCase
    {
        private readonly IQuizRepository _quizRepo;
        private readonly RecordQuizAttemptUseCase _recordAttempt;
        private readonly UnlockTrickUseCase _unlockUseCase;
        private readonly ILogger<ValidateQuizUseCase> _logger;
        private readonly int _maxAttempts;

        public ValidateQuizUseCase(
            IQuizRepository quizRepo,
            RecordQuizAttemptUseCase recordAttempt,
            UnlockTrickUseCase unlockUseCase,
            ILogger<ValidateQuizUseCase> logger,
            int maxAttempts = 3)
        {
            _quizRepo = quizRepo;
            _recordAttempt = recordAttempt;
            _unlockUseCase = unlockUseCase;
            _logger = logger;
            _maxAttempts = maxAttempts;
        }

        public async Task<(bool Success, string Message)> ExecuteAsync(string userId, string trickId, int answerIndex, CancellationToken ct = default)
        {
            try
            {
                _logger.LogDebug("User {UserId} validating quiz for trick {TrickId} with answer {AnswerIndex}", userId, trickId, answerIndex);

                var quiz = await _quizRepo.GetByTrickIdAsync(trickId, ct);
                if (quiz == null)
                {
                    _logger.LogWarning("Quiz not found for trick {TrickId}", trickId);
                    return (false, "Quiz not found");
                }

                if (answerIndex == quiz.CorrectAnswerIndex)
                {
                    _logger.LogInformation("User {UserId} answered correctly for trick {TrickId}", userId, trickId);
                    // unlock the trick
                    var (ok, msg) = await _unlockUseCase.ExecuteAsync(userId, trickId, ct);
                    return (ok, ok ? "Correct! " + msg : "Unlocked failed: " + msg);
                }
                else
                {
                    var attempts = await _recordAttempt.ExecuteAsync(userId, trickId, ct);
                    _logger.LogInformation("User {UserId} incorrect answer for trick {TrickId}. Attempts now {Attempts}", userId, trickId, attempts);

                    if (attempts >= _maxAttempts)
                    {
                        _logger.LogInformation("User {UserId} reached max attempts for trick {TrickId}", userId, trickId);
                        return (false, "Max attempts reached");
                    }

                    return (false, $"Incorrect answer. Attempts: {attempts}/{_maxAttempts}");
                }
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error validating quiz for user {UserId} trick {TrickId}", userId, trickId);
                return (false, "Internal error");
            }
        }
    }

}
