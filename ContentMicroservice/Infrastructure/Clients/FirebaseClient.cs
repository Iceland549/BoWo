using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Application.DTOs;
using Microsoft.Extensions.Logging;

namespace ContentMicroservice.Infrastructure.Clients
{
    /// <summary>
    /// Lightweight wrapper / stub for interacting with Firebase (Storage or Auth).
    /// In production replace implementation with Firebase Admin SDK or a proper HTTP client.
    /// </summary>
    public class FirebaseClient
    {
        private readonly ILogger<FirebaseClient> _logger;

        public FirebaseClient(ILogger<FirebaseClient> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Uploads a file stream to Firebase Storage and returns a public URL (stub).
        /// Implement with Firebase SDK or signed URLs in production.
        /// </summary>
        public async Task<string> UploadFileAsync(Stream fileStream, string filename, CancellationToken ct = default)
        {
            // This is a stub: just pretend we upload and return a placeholder URL.
            _logger.LogInformation("Uploading file to Firebase (stub): {Filename}", filename);
            await Task.Delay(100, ct);
            _logger.LogInformation("Stub upload of {Filename} to Firebase Storage", filename);
            var safeName = Uri.EscapeDataString($"{DateTime.UtcNow:yyyyMMddHHmmss}_{filename}");

            return $"https://firebase.storage.mock/{Uri.EscapeDataString(safeName)}";
        }
    }

}
