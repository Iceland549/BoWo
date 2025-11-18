using ContentMicroservice.Application.DTOs;
using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Application.UseCases.Quiz;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ContentMicroservice.Presentation.Controllers
{
    [ApiController]
    [Route("quiz")]
    [Authorize]
    public class QuizController : ControllerBase
    {
        private readonly IQuizRepository _quizRepo;
        private readonly ValidateQuizUseCase _validateUseCase;
        private readonly RewardAdCompleteUseCase _adUseCase;
        private readonly PurchaseValidationUseCase _purchaseUseCase;
        private readonly ILogger<QuizController> _logger;

        public QuizController(
            IQuizRepository quizRepo,
            ValidateQuizUseCase validateUseCase,
            RewardAdCompleteUseCase adUseCase,
            PurchaseValidationUseCase purchaseUseCase,
            ILogger<QuizController> logger)
        {
            _quizRepo = quizRepo;
            _validateUseCase = validateUseCase;
            _adUseCase = adUseCase;
            _purchaseUseCase = purchaseUseCase;
            _logger = logger;
        }

        private string GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            return claim?.Value ?? throw new InvalidOperationException("User id not found in token");
        }

        // ---------------------------------------------------------
        // GET QUIZ
        // ---------------------------------------------------------
        [HttpGet("{trickId}")]
        public async Task<IActionResult> GetQuiz(string trickId, CancellationToken ct = default)
        {
            try
            {
                var quiz = await _quizRepo.GetByTrickIdAsync(trickId, ct);
                if (quiz == null)
                    return NotFound();

                var dto = new QuizDto
                {
                    Id = quiz.Id,
                    TrickId = quiz.TrickId,
                    Question = quiz.Question,
                    Answers = quiz.Answers,
                    Difficulty = quiz.Difficulty
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching quiz for trick {TrickId}", trickId);
                return StatusCode(500, "Internal error");
            }
        }

        // ---------------------------------------------------------
        // VALIDATE QUIZ
        // ---------------------------------------------------------
        public class QuizAnswerRequest
        {
            public string TrickId { get; set; } = null!;
            public int AnswerIndex { get; set; }
        }

        [HttpPost("validate")]
        public async Task<IActionResult> Validate([FromBody] QuizAnswerRequest req, CancellationToken ct = default)
        {
            var userId = GetUserId();

            try
            {
                QuizValidationResponseDto result =
                    await _validateUseCase.ExecuteAsync(userId, req.TrickId, req.AnswerIndex, ct);

                return Ok(result); // <-- IMPORTANT : renvoyer l'objet complet
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating quiz for user {UserId} trick {TrickId}", userId, req.TrickId);
                return StatusCode(500, "Internal error");
            }
        }

        // ---------------------------------------------------------
        // AD REWARD
        // ---------------------------------------------------------
        public class AdRewardRequest
        {
            public string TrickId { get; set; } = null!;
            public string AdToken { get; set; } = null!;
        }

        [HttpPost("ad/reward")]
        public async Task<IActionResult> RewardAd([FromBody] AdRewardRequest req, CancellationToken ct = default)
        {
            var userId = GetUserId();
            try
            {
                var (success, message) = await _adUseCase.ExecuteAsync(userId, req.TrickId, req.AdToken, ct);
                return Ok(new { success, message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing ad reward for user {UserId} trick {TrickId}", userId, req.TrickId);
                return StatusCode(500, "Internal error");
            }
        }

        // ---------------------------------------------------------
        // PURCHASE VALIDATION
        // ---------------------------------------------------------
        public class PurchaseValidateRequest
        {
            public string TrickId { get; set; } = null!;
            public string PurchaseToken { get; set; } = null!;
        }

        [HttpPost("purchase/validate")]
        public async Task<IActionResult> ValidatePurchase([FromBody] PurchaseValidateRequest req, CancellationToken ct = default)
        {
            var userId = GetUserId();
            try
            {
                var (success, message) = await _purchaseUseCase.ExecuteAsync(userId, req.TrickId, req.PurchaseToken, ct);
                return Ok(new { success, message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating purchase for user {UserId} trick {TrickId}", userId, req.TrickId);
                return StatusCode(500, "Internal error");
            }
        }
    }
}
