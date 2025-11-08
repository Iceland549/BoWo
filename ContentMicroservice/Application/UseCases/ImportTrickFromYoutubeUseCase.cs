using AutoMapper;
using ContentMicroservice.Application.DTOs;
using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Infrastructure.Persistence.Entities;

namespace ContentMicroservice.Application.UseCases
{
    /// <summary>
    /// Import minimal metadata from a YouTube URL and create Trick entry.
    /// Real implementation could call YouTube Data API to fetch title/thumbnail.
    /// </summary>
    public class ImportTrickFromYoutubeUseCase
    {
        private readonly IContentRepository _repo;
        private readonly IMapper _mapper;
        private readonly ILogger<ImportTrickFromYoutubeUseCase> _logger;

        public ImportTrickFromYoutubeUseCase(IContentRepository repo, IMapper mapper, ILogger<ImportTrickFromYoutubeUseCase> logger)
        {
            _repo = repo;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<TrickDto> ExecuteAsync(string youtubeUrl, string authorId, CancellationToken ct = default)
        {
            _logger.LogInformation("Import trick from youtube {Url} by {Author}", youtubeUrl, authorId);

            // Minimal heuristic: set name from URL or fallback
            var name = $"Imported trick ({new Uri(youtubeUrl).Host})";

            // Create a Trick entity; repository may enrich or validate
            var trick = new Trick
            {
                Name = name,
                Description = $"Imported from {youtubeUrl}",
                VideoUrl = youtubeUrl,
                Tags = new List<string> { "imported", "youtube" },
                AuthorId = authorId,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _repo.ImportTrickFromYoutubeAsync(youtubeUrl, authorId, ct);
            // repo may return null if import fails; fallback to createTrick
            if (created == null)
            {
                created = await _repo.CreateTrickAsync(trick, ct);
            }

            return _mapper.Map<TrickDto>(created);
        }
    }

}
