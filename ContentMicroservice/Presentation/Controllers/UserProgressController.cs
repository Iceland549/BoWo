// ContentMicroservice.Presentation/Controllers/UserProgressController.cs
using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Application.UseCases.UserProgress;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ContentMicroservice.Presentation.Controllers
{
    [ApiController]
    [Route("progress")]
    [Authorize]
    public class UserProgressController : ControllerBase
    {
        private readonly GetUserProgressUseCase _getUseCase;
        private readonly UpdateDailyProgressUseCase _updateDailyUseCase;
        private readonly AddXPUseCase _addXpUseCase;
        private readonly ResetProgressIfNewDayUseCase _resetUseCase;
        private readonly UnlockMiniGameUseCase _unlockMiniGame;
        private readonly IUserProgressRepository _userProgressRepository;
        private readonly ILogger<UserProgressController> _logger;

        public UserProgressController(
            GetUserProgressUseCase getUseCase,
            UpdateDailyProgressUseCase updateDailyUseCase,
            AddXPUseCase addXpUseCase,
            ResetProgressIfNewDayUseCase resetUseCase,
            UnlockMiniGameUseCase unlockMiniGame,
            IUserProgressRepository userProgressRepository,
            ILogger<UserProgressController> logger)
        {
            _getUseCase = getUseCase;
            _updateDailyUseCase = updateDailyUseCase;
            _addXpUseCase = addXpUseCase;
            _resetUseCase = resetUseCase;
            _unlockMiniGame = unlockMiniGame;
            _userProgressRepository = userProgressRepository;
            _logger = logger;
        }

        private string GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            return claim?.Value ?? throw new InvalidOperationException("User id not found in token");
        }

        // ------------------------------------------------------
        // GET /progress  → progression complète (XP, avatars, etc.)
        // ------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetProgress(CancellationToken ct = default)
        {
            var userId = GetUserId();
            try
            {
                await _updateDailyUseCase.ExecuteEnsureDayResetAsync(userId, ct);
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
        // POST /progress/daily-progress  (appelé 1x/jour au launch)
        // ------------------------------------------------------
        [HttpPost("daily-progress")]
        public async Task<IActionResult> DailyProgress(CancellationToken ct = default)
        {
            var userId = GetUserId();

            try
            {
                await _updateDailyUseCase.ExecuteEnsureDayResetAsync(userId, ct);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating daily progress for user {User}", userId);
                return StatusCode(500, "Internal error");
            }
        }

        // ------------------------------------------------------
        // POST /progress/add-xp   (mini-jeux ou bonus génériques)
        // ------------------------------------------------------
        public class AddXpRequest
        {
            public int Xp { get; set; }
        }

        [HttpPost("add-xp")]
        public async Task<IActionResult> AddXp([FromBody] AddXpRequest req, CancellationToken ct = default)
        {
            var userId = GetUserId();

            if (req == null || req.Xp <= 0)
            {
                return BadRequest(new { success = false, message = "XP must be positive." });
            }

            try
            {
                await _addXpUseCase.ExecuteAsync(userId, req.Xp, ct);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding XP for user {User}", userId);
                return StatusCode(500, "Internal error");
            }
        }

        // ------------------------------------------------------
        // POST /progress/unlock-mini-game
        // ------------------------------------------------------
        public class UnlockMiniGameRequest
        {
            public string Key { get; set; } = string.Empty;
        }

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
                    _logger.LogWarning(
                        "Unlock mini-game failed for user {User}, key={Key}, reason={Reason}",
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

        // ------------------------------------------------------
        // POST /progress/avatar/bubble/select
        // → le joueur choisit sa bulle (niveau 2+)
        // ------------------------------------------------------
        public class SelectBubbleAvatarRequest
        {
            public string AvatarId { get; set; } = string.Empty;
        }

        [HttpPost("avatar/bubble/select")]
        public async Task<IActionResult> SelectBubbleAvatar(
            [FromBody] SelectBubbleAvatarRequest req,
            CancellationToken ct = default)
        {
            var userId = GetUserId();

            if (string.IsNullOrWhiteSpace(req.AvatarId))
            {
                return BadRequest(new { success = false, message = "AvatarId is required." });
            }

            try
            {
                var progress = await _userProgressRepository.GetByUserIdAsync(userId, ct);
                if (progress == null)
                {
                    return NotFound(new { success = false, message = "Progress not found." });
                }

                // ✅ On utilise XP + LevelCalculator pour connaître le niveau
                var levelInfo = LevelCalculator.Compute(progress.XP);
                if (levelInfo.Level < 2)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "You must reach at least level 2 to select a bubble avatar."
                    });
                }

                // ✅ Vérifier que l’ID de bulle est autorisé
                if (!AvatarCatalog.IsValidBubbleAvatar(req.AvatarId))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = $"Invalid bubble avatar id: {req.AvatarId}"
                    });
                }

                // Optionnel : ne permettre le choix qu'une seule fois
                if (!string.IsNullOrWhiteSpace(progress.BubbleAvatarId))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Bubble avatar already selected."
                    });
                }

                progress.BubbleAvatarId = req.AvatarId;

                await _userProgressRepository.SaveAsync(progress, ct);

                // On renvoie le DTO complet recalculé (avec XP, avatars, etc.)
                var dto = await _getUseCase.ExecuteAsync(userId, ct);

                return Ok(new { success = true, data = dto });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error selecting bubble avatar for user {User}", userId);
                return StatusCode(500, "Internal error");
            }
        }
    }
}
