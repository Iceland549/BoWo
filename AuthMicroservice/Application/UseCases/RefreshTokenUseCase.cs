using AuthMicroservice.Application.Interfaces;
using AuthMicroservice.Application.DTOs;

namespace AuthMicroservice.Application.UseCases
{
    /// <summary>
    /// Handles JWT refresh token flow.
    /// </summary>
    public class RefreshTokenUseCase
    {
        private readonly IAuthService _auth;

        public RefreshTokenUseCase(IAuthService auth) => _auth = auth;

        /// <summary>
        /// Returns a new access token using the given refresh token.
        /// </summary>
        /// <param name="refreshToken">The refresh token.</param>
        /// <returns>New JWT token if the refresh token is valid.</returns>
        public Task<JwtResponse?> ExecuteAsync(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                throw new ArgumentException("Refresh token cannot be null or empty.", nameof(refreshToken));

            return _auth.RefreshTokenAsync(refreshToken);
        }
    }
}