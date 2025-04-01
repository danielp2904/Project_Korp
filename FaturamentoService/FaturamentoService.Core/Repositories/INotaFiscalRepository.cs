using FaturamentoService.Core.Entities;
using MongoDB.Driver;

namespace FaturamentoService.Core.Repositories {
    public interface INotaFiscalRepository {
        Task<List<NotaFiscal>> GetAllAsync();
        Task<NotaFiscal> GetByIdAsync(Guid id);
        Task AddAsync(NotaFiscal nota);
        Task UpdateAsync(NotaFiscal nota, IClientSessionHandle session);
    }
}
