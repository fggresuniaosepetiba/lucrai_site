using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface ISignatureRepository
{
    Task<SignatureConfig?> GetAsync(string? company);
    Task<SignatureConfig> SaveAsync(SignatureConfig config);
}
