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

        public MongoContentRepository(MongoClient client, IOptions<MongoDbConfig> cfg)
        {
            var conf = cfg.Value;
            var db = client.GetDatabase(conf.Database);
            _tricks = db.GetCollection<Trick>(conf.TrickCollection);
            _videos = db.GetCollection<Video>(conf.VideoCollection);
            _profiles = db.GetCollection<UserProfile>(conf.UserProfileCollection);
        }

        public async Task<Trick> CreateTrickAsync(Trick trick, CancellationToken ct = default)
        {
            await _tricks.InsertOneAsync(trick, null, ct);
            return trick;
        }

        public async Task<Video> CreateVideoAsync(Video video, CancellationToken ct = default)
        {
            await _videos.InsertOneAsync(video, null, ct);
            return video;
        }

        public async Task<IList<Trick>> GetAllTricksAsync(CancellationToken ct = default)
        {
            var all = await _tricks.Find(Builders<Trick>.Filter.Empty).SortByDescending(t => t.CreatedAt).ToListAsync(ct);
            return all;
        }

        public async Task<Trick?> GetTrickByIdAsync(string id, CancellationToken ct = default)
        {
            var filter = Builders<Trick>.Filter.Eq(t => t.Id, id);
            return await _tricks.Find(filter).FirstOrDefaultAsync(ct);
        }

        public async Task<Trick?> ImportTrickFromYoutubeAsync(string youtubeUrl, string authorId, CancellationToken ct = default)
        {
            // Minimal import: avoid duplicates by videoUrl
            var existing = await _tricks.Find(t => t.VideoUrl == youtubeUrl).FirstOrDefaultAsync(ct);
            if (existing != null) return existing;

            var trick = new Trick
            {
                Name = $"Imported trick - {DateTime.UtcNow:yyyyMMddHHmmss}",
                Description = $"Auto-imported from {youtubeUrl}",
                VideoUrl = youtubeUrl,
                AuthorId = authorId,
                Tags = new List<string> { "youtube", "import" },
                CreatedAt = DateTime.UtcNow
            };

            await _tricks.InsertOneAsync(trick, null, ct);
            return trick;
        }
    }
}
