using AuthMicroservice.Application.DTOs;
using AuthMicroservice.Application.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthMicroservice.Presentation.Controllers
{
    [ApiController]
    [Route("account")]
    public class AccountController : ControllerBase
    {
        private readonly RegisterUserUseCase _register;
        private readonly ILogger<AccountController> _logger;
        private readonly GetProfileUseCase _profile;
        private readonly DeleteAccountUseCase _deleteAccount;

        public AccountController(RegisterUserUseCase register, GetProfileUseCase profile,  ILogger<AccountController> logger, DeleteAccountUseCase deleteAccount)
        {
            _register = register;
            _profile = profile;
            _logger = logger;
            _deleteAccount = deleteAccount;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid request" });

            try
            {
                await _register.ExecuteAsync(req.Email, req.Password);

                return Ok(ApiResponse.Ok());
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled error during registration");
                return StatusCode(500, ApiResponse.Fail("Internal server error"));
            }
        }

        [HttpDelete("account")]
        [Authorize]
        public async Task<IActionResult> DeleteAccount(CancellationToken ct)
        {
            var userId = User.FindFirst("sub")?.Value;
            if (userId == null)
                return Unauthorized();

            var success = await _deleteAccount.ExecuteAsync(userId, ct);

            if (!success)
                return NotFound(new { message = "User not found" });

            return Ok(new { success = true });
        }


        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Profile()
        {
            var dto = await _profile.ExecuteAsync(User);
            return Ok(ApiResponse<ProfileDto>.Ok(dto));
        }
    }
}
