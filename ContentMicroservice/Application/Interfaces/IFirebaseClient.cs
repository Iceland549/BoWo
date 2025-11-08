namespace ContentMicroservice.Application.Interfaces
{
    public interface IFirebaseClient
    {
        /// <summary>
        /// Uploads a stream and returns a publicly reachable URL (or signed URL).
        /// </summary>
        Task<string> UploadFileAsync(Stream fileStream, string filename, CancellationToken ct = default);

    }
}
