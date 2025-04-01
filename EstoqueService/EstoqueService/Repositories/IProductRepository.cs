using EstoqueService.Entities;
using MongoDB.Driver;

namespace EstoqueService.Core.Repositories {
    public interface IProductRepository {
        Task<List<Product>> GetAllAsync();
        Task<Product> GetProductByIdAsync(Guid id);
        Task AddAsync(Product product);        
        Task UpdateAsync(Product product, IClientSessionHandle session);
    }
}
