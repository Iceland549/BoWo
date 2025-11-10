using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Infrastructure.Config;
using ContentMicroservice.Infrastructure.Persistence.Entities;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace ContentMicroservice.Infrastructure.Persistence.Repositories
{
    public class MongoUserProgressRepository : IUserProgressRepository
    {
        private readonly IMongoCollection<UserProgress> _collection;

        public MongoUserProgressRepository(IMongoClient client, IOptions<MongoDbConfig> cfg)
        {
            var conf = cfg.Value;
            var db = client.GetDatabase(conf.Database);
            var collName = conf.UserProfileCollection ?? "userprogress";
            _collection = db.GetCollection<UserProgress>(collName);
        }

        public async Task<UserProgress?> GetByUserIdAsync(string userId, CancellationToken ct = default)
        {
            var filter = Builders<UserProgress>.Filter.Eq(p => p.UserId, userId);
            return await _collection.Find(filter).FirstOrDefaultAsync(ct);
        }

        public async Task<UserProgress> CreateAsync(UserProgress progress, CancellationToken ct = default)
        {
            await _collection.InsertOneAsync(progress, null, ct);
            return progress;
        }

        public async Task<UserProgress> SaveAsync(UserProgress progress, CancellationToken ct = default)
        {
            var filter = Builders<UserProgress>.Filter.Eq(p => p.UserId, progress.UserId);
            var options = new ReplaceOptions { IsUpsert = true };
            await _collection.ReplaceOneAsync(filter, progress, options, ct);
            return progress;
        }

        public async Task<bool> ExistsAsync(string userId, CancellationToken ct = default)
        {
            var filter = Builders<UserProgress>.Filter.Eq(p => p.UserId, userId);
            var count = await _collection.CountDocumentsAsync(filter, null, ct);
            return count > 0;
        }
    }

}
