using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Infrastructure.Config;
using ContentMicroservice.Infrastructure.Persistence.Entities;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace ContentMicroservice.Infrastructure.Persistence
{
    public class MongoContentRepository : IContentRepository
    {
        private readonly IMongoCollection<Trick> _tricks;
        private readonly IMongoCollection<Video> _videos;
        private readonly IMongoCollection<UserProfile> _profiles;
        private readonly ILogger<MongoContentRepository> _logger;

        public MongoContentRepository(
            MongoClient client,
            IOptions<MongoDbConfig> cfg,
            ILogger<MongoContentRepository> logger)
        {
            _logger = logger;
            var conf = cfg.Value;
            var db = client.GetDatabase(conf.Database);
            _tricks = db.GetCollection<Trick>(conf.TrickCollection);
            _videos = db.GetCollection<Video>(conf.VideoCollection);
            _profiles = db.GetCollection<UserProfile>(conf.UserProfileCollection);
        }

        public async Task<Trick> CreateTrickAsync(Trick trick, CancellationToken ct = default)
        {
            try
            {
                await _tricks.InsertOneAsync(trick, null, ct);
                _logger.LogInformation("Inserted new trick: {TrickName}", trick.Name);
                return trick;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to insert trick {TrickName}", trick.Name);
                throw;
            }
        }

        public async Task<Video> CreateVideoAsync(Video video, CancellationToken ct = default)
        {
            await _videos.InsertOneAsync(video, null, ct);
            _logger.LogInformation("Inserted new video for trick {TrickId}", video.TrickId);
            return video;
        }

        public async Task<IList<Trick>> GetAllTricksAsync(CancellationToken ct = default)
        {
            try
            {
                var all = await _tricks
                    .Find(Builders<Trick>.Filter.Empty)
                    .SortByDescending(t => t.CreatedAt)
                    .ToListAsync(ct);

                _logger.LogInformation("Fetched {Count} tricks from MongoDB", all.Count);
                return all;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching tricks from MongoDB");
                throw;
            }
        }

        public async Task<Trick?> GetTrickByIdAsync(string id, CancellationToken ct = default)
        {
            try
            {
                var filter = Builders<Trick>.Filter.Eq(t => t.Id, id);
                var trick = await _tricks.Find(filter).FirstOrDefaultAsync(ct);

                if (trick == null)
                    _logger.LogWarning("No trick found with id {TrickId}", id);
                else
                    _logger.LogInformation("Fetched trick {TrickName} ({TrickId})", trick.Name, trick.Id);

                return trick;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving trick {TrickId}", id);
                throw;
            }
        }

        public async Task<Trick?> ImportTrickFromYoutubeAsync(string youtubeUrl, string authorId, CancellationToken ct = default)
        {
            try
            {
                // Vérifie si le trick existe déjà (par URL de vidéo)
                var existing = await _tricks.Find(t => t.Videos.AmateurUrl == youtubeUrl).FirstOrDefaultAsync(ct);
                if (existing != null)
                {
                    _logger.LogInformation("Trick already imported from {Url}", youtubeUrl);
                    return existing;
                }

                var trick = new Trick
                {
                    Name = $"Imported trick - {DateTime.UtcNow:yyyyMMddHHmmss}",
                    Description = $"Auto-imported from {youtubeUrl}",
                    Level = "intermediate",
                    Price = 0.0,
                    Videos = new TrickVideos
                    {
                        AmateurUrl = youtubeUrl
                    },
                    FunFact = "Imported automatically from YouTube.",
                    CreatedAt = DateTime.UtcNow
                };

                await _tricks.InsertOneAsync(trick, null, ct);
                _logger.LogInformation("New trick imported from YouTube: {Url}", youtubeUrl);
                return trick;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing trick from YouTube {Url}", youtubeUrl);
                throw;
            }
        }
    }
}
