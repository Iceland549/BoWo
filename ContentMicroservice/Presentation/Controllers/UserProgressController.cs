using ContentMicroservice.Application.UseCases.UserProgress;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ContentMicroservice.Presentation.Controllers
{
    [ApiController]
    [Route("progress")]
    [Authorize]
    public class UserProgressController : ControllerBase
    {
        private readonly GetUserProgressUseCase _getUseCase;
        private readonly ResetProgressIfNewDayUseCase _resetUseCase;
        private readonly UnlockMiniGameUseCase _unlockMiniGame;
        private readonly ILogger<UserProgressController> _logger;

        public UserProgressController(
            GetUserProgressUseCase getUseCase,
            ResetProgressIfNewDayUseCase resetUseCase,
            UnlockMiniGameUseCase unlockMiniGame,
            ILogger<UserProgressController> logger)
        {
            _getUseCase = getUseCase;
            _resetUseCase = resetUseCase;
            _unlockMiniGame = unlockMiniGame;
            _logger = logger;
        }

        private string GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            return claim?.Value ?? throw new InvalidOperationException("User id not found in token");
        }

        // ------------------------------------------------------
        // GET /progress  → progression + mini-jeux débloqués
        // ------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetProgress(CancellationToken ct = default)
        {
            var userId = GetUserId();
            try
            {
                await _resetUseCase.ExecuteAsync(userId, ct); // ensure daily reset if needed
                var dto = await _getUseCase.ExecuteAsync(userId, ct);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching progress for user {User}", userId);
                return StatusCode(500, "Internal error");
            }
        }

        // ------------------------------------------------------
        // POST /progress/unlock-mini-game
        // ------------------------------------------------------
        [HttpPost("unlock-mini-game")]
        public async Task<IActionResult> UnlockMiniGame(
            [FromBody] UnlockMiniGameRequest req,
            CancellationToken ct = default)
        {
            var userId = GetUserId();

            try
            {
                _logger.LogInformation("User {User} requests unlock of mini-game {Key}", userId, req.Key);

                var result = await _unlockMiniGame.ExecuteAsync(userId, req.Key, ct);

                if (!result.Success)
                {
                    _logger.LogWarning("Unlock mini-game failed for user {User}, key={Key}, reason={Reason}",
                        userId, req.Key, result.Message);

                    return BadRequest(new { success = false, message = result.Message });
                }

                _logger.LogInformation("Mini-game {Key} unlocked for user {User}", req.Key, userId);
                return Ok(new { success = true, message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unlocking mini-game {Key} for user {User}", req.Key, userId);
                return StatusCode(500, "Internal error");
            }
        }

        public class UnlockMiniGameRequest
        {
            public string Key { get; set; } = string.Empty;
        }

        // ------------------------------------------------------
        // POST /progress/reset   (optionnel, debug/admin)
        // ------------------------------------------------------
        [HttpPost("reset")]
        public async Task<IActionResult> ResetProgress(CancellationToken ct = default)
        {
            var userId = GetUserId();
            try
            {
                await _resetUseCase.ExecuteAsync(userId, ct);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting progress for user {User}", userId);
                return StatusCode(500, "Internal error");
            }
        }
    }
}
