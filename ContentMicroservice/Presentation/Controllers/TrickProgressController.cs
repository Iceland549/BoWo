using ContentMicroservice.Application.UseCases.TrickProgress;
using ContentMicroservice.Application.UseCases.UserProgress;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ContentMicroservice.Presentation.Controllers
{
    [ApiController]
    [Route("progress")]   
    [Authorize]
    public class TrickProgressController : ControllerBase
    {
        private readonly GetNextQuestionUseCase _getNextQuestion;
        private readonly SubmitQuestionAnswerUseCase _submitAnswer;
        private readonly AddXPUseCase _addXP;
        private readonly ILogger<TrickProgressController> _logger;

        public TrickProgressController(
            GetNextQuestionUseCase getNextQuestion,
            SubmitQuestionAnswerUseCase submitAnswer,
            AddXPUseCase addXP,
            ILogger<TrickProgressController> logger)
        {
            _getNextQuestion = getNextQuestion;
            _submitAnswer = submitAnswer;
            _addXP = addXP;
            _logger = logger;
        }

        private string GetUserId()
        {
            var userId =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
                throw new InvalidOperationException("User id not found in token.");

            return userId;
        }

        // ------------------------------------------------------------------
        // GET /progress/{trickId}/next
        // ------------------------------------------------------------------
        [HttpGet("{trickId}/next")]
        public async Task<IActionResult> GetNextQuestion(string trickId)
        {
            var userId = GetUserId();

            _logger.LogInformation(
                "[GET NEXT] User={User} → GET /progress/{Trick}/next",
                userId, trickId);

            try
            {
                var result = await _getNextQuestion.ExecuteAsync(userId, trickId);

                _logger.LogInformation(
                    "[GET NEXT] Question found for trick={Trick}. Level={Level} Type={Type}",
                    trickId,
                    result?.CurrentLevel,
                    result?.Question?.Type);

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(
                    "[GET NEXT] Trick NOT FOUND in QuestionBank → {Trick}. Message={Msg}",
                    trickId,
                    ex.Message);

                return NotFound(new { error = $"No questions defined for trick '{trickId}'" });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex, "[GET NEXT] Unexpected error for trick {Trick}", trickId);

                return StatusCode(500, "Internal error");
            }
        }

        public class SubmitAnswerBody
        {
            public int Level { get; set; }
            public string UserAnswer { get; set; } = default!;
        }

        // ------------------------------------------------------------------
        // POST /progress/{trickId}/answer
        // ------------------------------------------------------------------
        [HttpPost("{trickId}/answer")]
        public async Task<IActionResult> SubmitAnswer(string trickId,
            [FromBody] SubmitAnswerBody body)
        {
            var userId = GetUserId();

            _logger.LogInformation(
                "[ANSWER] User={User} trick={Trick} level={Level} answer={Answer}",
                userId, trickId, body.Level, body.UserAnswer);

            try
            {
                var result = await _submitAnswer.ExecuteAsync(
                    userId,
                    trickId,
                    new SubmitAnswerRequest
                    {
                        Level = body.Level,
                        UserAnswer = body.UserAnswer
                    });

                _logger.LogInformation(
                    "[ANSWER] Result → Correct={Correct} XPGained={XP}",
                    result.Correct,
                    result.XpGained);

                if (result.Correct && result.XpGained > 0)
                {
                    await _addXP.ExecuteAsync(userId, result.XpGained);
                    _logger.LogInformation(
                        "[ANSWER] XP applied → +{XP} for user {User}",
                        result.XpGained, userId);
                }

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(
                    "[ANSWER] Trick NOT FOUND in QuestionBank → {Trick}. Msg={Msg}",
                    trickId, ex.Message);

                return NotFound(new { error = $"No questions defined for trick '{trickId}'" });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex, "[ANSWER] Unexpected error trick={Trick}", trickId);

                return StatusCode(500, "Internal error");
            }
        }
    }
}
