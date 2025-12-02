using AuthMicroservice.Application.Interfaces;

public class DeleteAccountUseCase
{
    private readonly IUserRepository _userRepo;
    private readonly ILogger<DeleteAccountUseCase> _logger;

    public DeleteAccountUseCase(
        IUserRepository userRepo,
        ILogger<DeleteAccountUseCase> logger)
    {
        _userRepo = userRepo;
        _logger = logger;
    }

    public async Task<bool> ExecuteAsync(string userId, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByIdAsync(userId);
        if (user == null)
            return false;

        await _userRepo.DeleteAsync(userId, ct);

        _logger.LogInformation("User {UserId} deleted successfully.", userId);

        return true;
    }
}
