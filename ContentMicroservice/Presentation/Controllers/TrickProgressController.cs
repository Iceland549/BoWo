using ContentMicroservice.Application.UseCases.Progress;
using ContentMicroservice.Application.UseCases.TrickProgress;
using ContentMicroservice.Application.UseCases.UserProgress;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ContentMicroservice.Api.Controllers
{
    [ApiController]
    [Route("api/progress")]
    [Authorize] // JWT obligatoire
    public class TrickProgressController : ControllerBase
    {
        private readonly GetNextQuestionUseCase _getNextQuestion;
        private readonly SubmitQuestionAnswerUseCase _submitAnswer;
        private readonly AddXPUseCase _addXP;

        public TrickProgressController(
            GetNextQuestionUseCase getNextQuestion,
            SubmitQuestionAnswerUseCase submitAnswer,
            AddXPUseCase addXP)
        {
            _getNextQuestion = getNextQuestion;
            _submitAnswer = submitAnswer;
            _addXP = addXP;
        }

        /// <summary>
        /// Récupère l’ID utilisateur depuis le JWT (Claim: sub ou NameIdentifier)
        /// </summary>
        private string GetUserId()
        {
            var userId =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userId))
                throw new System.InvalidOperationException("User id not found in token.");

            return userId;
        }

        /// <summary>
        /// GET /api/progress/{trickId}/next
        /// Renvoie la prochaine question Duolingo-like pour ce trick.
        /// </summary>
        [HttpGet("{trickId}/next")]
        public async Task<IActionResult> GetNextQuestion(string trickId)
        {
            var userId = GetUserId();
            var result = await _getNextQuestion.ExecuteAsync(userId, trickId);
            return Ok(result);
        }

        public class SubmitAnswerBody
        {
            public int Level { get; set; }
            public string UserAnswer { get; set; } = default!;
        }

        /// <summary>
        /// POST /api/progress/{trickId}/answer
        /// Vérifie la réponse, augmente le niveau, donne des XP si correct.
        /// </summary>
        [HttpPost("{trickId}/answer")]
        public async Task<IActionResult> SubmitAnswer(
            string trickId,
            [FromBody] SubmitAnswerBody body)
        {
            var userId = GetUserId();

            var result = await _submitAnswer.ExecuteAsync(
                userId,
                trickId,
                new SubmitAnswerRequest
                {
                    Level = body.Level,
                    UserAnswer = body.UserAnswer
                });

            // ★ NOUVEAU — XP intégré selon result.XpGained
            if (result.Correct && result.XpGained > 0)
            {
                await _addXP.ExecuteAsync(userId, result.XpGained);
            }

            return Ok(result);
        }
    }
}
