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
        private readonly GetProfileUseCase _profile;

        public AccountController(RegisterUserUseCase register, GetProfileUseCase profile)
        {
            _register = register;
            _profile = profile;
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

                return Ok(new
                {
                    success = true,
                    message = "Registration successful"
                });
            }
            catch (InvalidOperationException ex)
            {
                // Email already in use
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                // Unexpected error → now logged cleanly
                return StatusCode(500, new
                {
                    success = false,
                    message = "Internal server error",
                    detail = ex.Message
                });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Profile()
        {
            var dto = await _profile.ExecuteAsync(User);
            return Ok(dto);
        }
    }
}
