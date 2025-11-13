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

        public AccountController(RegisterUserUseCase register, GetProfileUseCase profile, ILogger<AccountController> logger)
        {
            _register = register;
            _profile = profile;
            _logger = logger;
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

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Profile()
        {
            var dto = await _profile.ExecuteAsync(User);
            return Ok(ApiResponse<ProfileDto>.Ok(dto));
        }
    }
}
