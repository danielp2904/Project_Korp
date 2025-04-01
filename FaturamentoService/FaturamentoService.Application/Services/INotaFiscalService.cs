using FaturamentoService.Application.InputModels;
using FaturamentoService.Application.ViewModels;
using FaturamentoService.Core.Entities;
using MongoDB.Driver;

namespace FaturamentoService.Application.Services {
    public interface INotaFiscalService {
        Task<List<NotaFiscalViewModel>> GetAllAsync();
        Task<NotaFiscalViewModel> GetByIdAsync(Guid id);
        Task<Guid> AddAsync(AddNotaInputModel notaItem);
        Task<NotaFiscalViewModel> UpdateAsync(Guid id,bool processar, IClientSessionHandle session);
    }
}
