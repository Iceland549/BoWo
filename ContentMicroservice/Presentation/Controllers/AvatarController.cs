// FILE: ContentMicroservice.Presentation/Controllers/AvatarController.cs
using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using ContentMicroservice.Application.UseCases.UserProgress;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ContentMicroservice.Presentation.Controllers
{
    [ApiController]
    [Route("progress/avatar")]
    [Authorize]
    public sealed class AvatarController : ControllerBase
    {
        private readonly GetShapeAvatarShopUseCase _getShapeShopUseCase;
        private readonly UnlockShopShapeAvatarUseCase _unlockShopShapeUseCase;
        private readonly ILogger<AvatarController> _logger;

        public AvatarController(
            GetShapeAvatarShopUseCase getShapeShopUseCase,
            UnlockShopShapeAvatarUseCase unlockShopShapeUseCase,
            ILogger<AvatarController> logger)
        {
            _getShapeShopUseCase = getShapeShopUseCase;
            _unlockShopShapeUseCase = unlockShopShapeUseCase;
            _logger = logger;
        }

        private string GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            return claim?.Value ?? throw new InvalidOperationException("User id not found in token");
        }

        [HttpGet("shop/shapes")]
        public async Task<IActionResult> GetShapeShop(CancellationToken ct = default)
        {
            try
            {
                var userId = GetUserId();
                var dto = await _getShapeShopUseCase.ExecuteAsync(userId, ct);
                return Ok(new { success = true, data = dto });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled error in GetShapeShop");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpPost("shop/shapes/{shapeId}/unlock")]
        public async Task<IActionResult> UnlockShapeFromShop(string shapeId, CancellationToken ct = default)
        {
            try
            {
                var userId = GetUserId();
                var (success, message, progress) = await _unlockShopShapeUseCase.ExecuteAsync(userId, shapeId, ct);

                if (!success)
                    return BadRequest(new { success = false, message });

                return Ok(new { success = true, message, data = progress });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled error in UnlockShapeFromShop. shapeId={ShapeId}", shapeId);
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
    }
}
