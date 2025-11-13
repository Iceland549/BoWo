using AutoMapper;
using ContentMicroservice.Application.DTOs;
using ContentMicroservice.Application.UseCases.Content;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ContentMicroservice.Presentation.Controllers
{
    [ApiController]
    [Route("content")]
    public class ContentController : ControllerBase
    {
        private readonly GetTrickUseCase _getTrickUseCase;
        private readonly GetTrickLearnUseCase _getTrickLearnUseCase;
        private readonly ImportTrickFromYoutubeUseCase _importUseCase;
        private readonly UploadUserVideoUseCase _uploadUseCase;
        private readonly IMapper _mapper;
        private readonly ILogger<ContentController> _logger;

        public ContentController(
            GetTrickUseCase getTrickUseCase,
            GetTrickLearnUseCase getTrickLearnUseCase,
            ImportTrickFromYoutubeUseCase importUseCase,
            UploadUserVideoUseCase uploadUseCase,
            IMapper mapper,
            ILogger<ContentController> logger)
        {
            _getTrickUseCase = getTrickUseCase;
            _getTrickLearnUseCase = getTrickLearnUseCase;
            _importUseCase = importUseCase;
            _uploadUseCase = uploadUseCase;
            _mapper = mapper;
            _logger = logger;
        }

        /// <summary>
        /// Get list of tricks (public).
        /// </summary>
        [HttpGet("tricks")]
        public async Task<IActionResult> GetTricks(CancellationToken ct = default)
        {
            var dtos = await _getTrickUseCase.ExecuteAsync(ct);
            return Ok(dtos);
        }

        /// <summary>
        /// Get trick by id
        /// </summary>
        [HttpGet("tricks/{id}")]
        public async Task<IActionResult> GetTrickById(string id, CancellationToken ct = default)
        {
            var dto = await _getTrickUseCase.ExecuteByIdAsync(id, ct);
            if (dto == null) return NotFound();
            return Ok(dto);
        }

        /// <summary>
        /// Contenu d’apprentissage (protégé) : nécessite un trick déverrouillé.
        /// </summary>
        [HttpGet("tricks/{id}/learn")]
        [Authorize]
        [ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Client)]
        public async Task<IActionResult> GetLearn(string id, CancellationToken ct = default)
        {
            // userId depuis le token (NameIdentifier ou "sub")
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            var userId = claim?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            (bool allowed, TrickLearnDto? data, string? error) = await _getTrickLearnUseCase.ExecuteAsync(userId, id, ct);
            if (error == "NotFound") return NotFound();
            if (!allowed) return Forbid(); // 403 quand non déverrouillé

            return Ok(data);
        }


        /// <summary>
        /// Import a trick from a YouTube URL.
        /// Authenticated users only recommended (but left open for MVP)
        /// </summary>
        [HttpPost("import/youtube")]
        //[Authorize] // enable when you want only logged users to import
        public async Task<IActionResult> ImportFromYoutube([FromBody] ImportYoutubeRequest request, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(request.Url)) return BadRequest("Url is required");

            // authorId can come from token; fallback to provided or "anonymous"
            var authorId = User?.Identity?.IsAuthenticated == true
                ? User.FindFirst("sub")?.Value ?? request.AuthorId ?? "anonymous"
                : request.AuthorId ?? "anonymous";

            var dto = await _importUseCase.ExecuteAsync(request.Url, authorId, ct);
            return CreatedAtAction(nameof(GetTrickById), new { id = dto.Id }, dto);
        }

        /// <summary>
        /// Upload user video (multipart/form-data)
        /// </summary>
        [HttpPost("videos/upload")]
        //[Authorize] // enable when you want only logged users to upload
        [RequestSizeLimit(200_000_000)] // ~200MB limit example
        public async Task<IActionResult> UploadVideo([FromForm] IFormFile file, [FromForm] string? uploaderId, CancellationToken ct = default)
        {
            if (file == null || file.Length == 0) return BadRequest("File is required");

            using var stream = file.OpenReadStream();
            var filename = file.FileName;

            var actualUploader = User?.Identity?.IsAuthenticated == true
                ? User.FindFirst("sub")?.Value ?? uploaderId ?? "anonymous"
                : uploaderId ?? "anonymous";

            var videoDto = await _uploadUseCase.ExecuteAsync(stream, filename, actualUploader, ct);
            return CreatedAtAction(nameof(GetTrickById), new { id = videoDto.Id }, videoDto);
        }

        // Request DTOs
        public class ImportYoutubeRequest
        {
            public string Url { get; set; } = null!;
            public string? AuthorId { get; set; }
        }
    }
}
