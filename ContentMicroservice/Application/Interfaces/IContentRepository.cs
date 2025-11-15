using ContentMicroservice.Infrastructure.Persistence.Entities;

namespace ContentMicroservice.Application.Interfaces
{
    public interface IContentRepository
    {
        Task<IList<Trick>> GetAllTricksAsync(CancellationToken ct = default);
        Task<Trick?> GetTrickByIdAsync(string id, CancellationToken ct = default);
        Task<Trick> CreateTrickAsync(Trick trick, CancellationToken ct = default);
        Task<Video> CreateVideoAsync(Video video, CancellationToken ct = default);
    }
}
