using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Infrastructure.Config;
using ContentMicroservice.Infrastructure.Persistence.Entities;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace ContentMicroservice.Infrastructure.Persistence.Repositories
{
    public class MongoQuizRepository : IQuizRepository
    {
        private readonly IMongoCollection<Quiz> _collection;

        public MongoQuizRepository(IMongoClient client, IOptions<MongoDbConfig> cfg)
        {
            var conf = cfg.Value;
            var db = client.GetDatabase(conf.Database);
            //var collName = conf.TrickCollection + "_quiz";
            _collection = db.GetCollection<Quiz>("quizzes");
        }

        public async Task CreateAsync(Quiz question, CancellationToken ct = default)
        {
            await _collection.InsertOneAsync(question, null, ct);
        }

        public async Task<IEnumerable<Quiz>> GetAllAsync(CancellationToken ct = default)
        {
            return await _collection.Find(_ => true).ToListAsync(ct);
        }

        public async Task<Quiz?> GetByTrickIdAsync(string trickId, CancellationToken ct = default)
        {
            var filter = Builders<Quiz>.Filter.Eq(q => q.TrickId, trickId);
            return await _collection.Find(filter).FirstOrDefaultAsync(ct);
        }

        public async Task<bool> ExistsForTrickAsync(string trickId, CancellationToken ct = default)
        {
            var filter = Builders<Quiz>.Filter.Eq(q => q.TrickId, trickId);
            var count = await _collection.CountDocumentsAsync(filter, null, ct);
            return count > 0;
        }
    }

}
