using ContentMicroservice.Infrastructure.Persistence.Entities;

namespace ContentMicroservice.Application.Interfaces
{
    public interface IUserProgressRepository
    {
        Task<UserProgress?> GetByUserIdAsync(string userId, CancellationToken ct = default);
        Task<UserProgress> CreateAsync(UserProgress progress, CancellationToken ct = default);
        Task<UserProgress> SaveAsync(UserProgress progress, CancellationToken ct = default);
        Task<bool> ExistsAsync(string userId, CancellationToken ct = default);

    }
}
