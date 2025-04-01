using EstoqueService.Application.InputModels;
using EstoqueService.Application.ViewModels;
using MongoDB.Driver;

namespace EstoqueService.Application.Services {
    public interface IProductService {
        Task<List<ProductViewModel>> GetAllAsync();
        Task<ProductViewModel> GetByIdAsync(Guid id);
        Task<Guid> AddAsync(AddProductInputModel productInputModel);
        Task<ProductViewModel> UpdateAsync(Guid productId, AddProductInputModel product, IClientSessionHandle session);
    }
}
