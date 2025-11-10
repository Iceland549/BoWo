using ContentMicroservice.Application.DTOs;
using ContentMicroservice.Application.Interfaces;
using AutoMapper;
using ContentMicroservice.Infrastructure.Persistence.Entities;

namespace ContentMicroservice.Application.UseCases.Content
{
    public class GetTrickUseCase
    {
        private readonly IContentRepository _repo;
        private readonly IMapper _mapper;

        public GetTrickUseCase(IContentRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<IList<TrickDto>> ExecuteAsync(CancellationToken ct = default)
        {
            var tricks = await _repo.GetAllTricksAsync(ct);
            return tricks.Select(t => _mapper.Map<TrickDto>(t)).ToList();
        }

        public async Task<TrickDto?> ExecuteByIdAsync(string id, CancellationToken ct = default)
        {
            var trick = await _repo.GetTrickByIdAsync(id, ct);
            if (trick == null) return null;
            return _mapper.Map<TrickDto>(trick);
        }
    }

}
