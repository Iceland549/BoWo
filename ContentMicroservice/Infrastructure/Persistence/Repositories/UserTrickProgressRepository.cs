using ContentMicroservice.Application.Interfaces;
using ContentMicroservice.Infrastructure.Persistence.Entities;
using MongoDB.Driver;

namespace ContentMicroservice.Infrastructure.Persistence.Repositories
{
    public class UserTrickProgressRepository : IUserTrickProgressRepository
    {
        private readonly IMongoCollection<UserTrickProgress> _collection;

        public UserTrickProgressRepository(IMongoDatabase database)
        {
            _collection = database.GetCollection<UserTrickProgress>("user_trick_progress");
        }

        public async Task<UserTrickProgress?> GetAsync(string userId, string trickId)
        {
            var filter = Builders<UserTrickProgress>.Filter.And(
                Builders<UserTrickProgress>.Filter.Eq(x => x.UserId, userId),
                Builders<UserTrickProgress>.Filter.Eq(x => x.TrickId, trickId)
            );

            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task CreateAsync(UserTrickProgress progress)
        {
            await _collection.InsertOneAsync(progress);
        }

        public async Task UpdateAsync(UserTrickProgress progress)
        {
            var filter = Builders<UserTrickProgress>.Filter.Eq(x => x.Id, progress.Id);
            await _collection.ReplaceOneAsync(filter, progress);
        }
    }

}
