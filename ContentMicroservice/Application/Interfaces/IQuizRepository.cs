using ContentMicroservice.Infrastructure.Persistence.Entities;

namespace ContentMicroservice.Application.Interfaces
{
    public interface IQuizRepository
    {
        Task<Quiz?> GetByTrickIdAsync(string trickId, CancellationToken ct = default);
        Task<IEnumerable<Quiz>> GetAllAsync(CancellationToken ct = default);
        Task CreateAsync(Quiz question, CancellationToken ct = default);
        Task<bool> ExistsForTrickAsync(string trickId, CancellationToken ct = default);

    }
}
