using ContentMicroservice.Application.DTOs;
using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Infrastructure.Persistence.Entities;
using AutoMapper;

namespace ContentMicroservice.Application.UseCases
{
    public class UploadUserVideoUseCase
    {
        private readonly IFirebaseClient _firebase;
        private readonly IContentRepository _repo;
        private readonly IMapper _mapper;
        private readonly ILogger<UploadUserVideoUseCase> _logger;

        public UploadUserVideoUseCase(IFirebaseClient firebase, IContentRepository repo, IMapper mapper, ILogger<UploadUserVideoUseCase> logger)
        {
            _firebase = firebase;
            _repo = repo;
            _mapper = mapper;
            _logger = logger;
        }

        /// <summary>
        /// Uploads the file stream to Firebase (storage) and records a Video in database.
        /// </summary>
        public async Task<VideoDto> ExecuteAsync(Stream fileStream, string filename, string uploaderId, CancellationToken ct = default)
        {
            _logger.LogInformation("Uploading video {Filename} by {Uploader}", filename, uploaderId);

            var url = await _firebase.UploadFileAsync(fileStream, filename, ct);

            var video = new Video
            {
                Url = url,
                Filename = filename,
                UploaderId = uploaderId,
                UploadedAt = DateTime.UtcNow
            };

            var created = await _repo.CreateVideoAsync(video, ct);
            return _mapper.Map<VideoDto>(created);
        }
    }

}
