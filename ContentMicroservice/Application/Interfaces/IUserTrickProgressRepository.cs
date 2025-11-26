using ContentMicroservice.Infrastructure.Persistence.Entities;

namespace ContentMicroservice.Application.Interfaces
{
    public interface IUserTrickProgressRepository
    {
        Task<UserTrickProgress?> GetAsync(string userId, string trickId);
        Task CreateAsync(UserTrickProgress progress);
        Task UpdateAsync(UserTrickProgress progress);

    }
}
