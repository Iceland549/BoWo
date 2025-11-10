using ContentMicroservice.Application.UseCases.UserProgress;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ContentMicroservice.Presentation.Controllers
{
    [ApiController]
    [Route("api/progress")]
    [Authorize]
    public class UserProgressController : ControllerBase
    {
        private readonly GetUserProgressUseCase _getUseCase;
        private readonly ResetProgressIfNewDayUseCase _resetUseCase;
        private readonly ILogger<UserProgressController> _logger;

        public UserProgressController(
            GetUserProgressUseCase getUseCase,
            ResetProgressIfNewDayUseCase resetUseCase,
            ILogger<UserProgressController> logger)
        {
            _getUseCase = getUseCase;
            _resetUseCase = resetUseCase;
            _logger = logger;
        }

        private string GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            return claim?.Value ?? throw new InvalidOperationException("User id not found in token");
        }

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

        // optional admin/test endpoint to reset progress (protected for admins in future)
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
