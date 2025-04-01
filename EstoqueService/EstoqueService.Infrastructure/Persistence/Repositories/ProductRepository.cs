
using EstoqueService.Core.Repositories;
using EstoqueService.Entities;
using MongoDB.Driver;

namespace EstoqueService.Infrastructure.Persistence.Repositories {
    public class ProductRepository : IProductRepository {
        private readonly IMongoCollection<Product> _products;
        public ProductRepository(IMongoDatabase data) {
            _products = data.GetCollection<Product>("product");
        }

        public async Task AddAsync(Product product) {
            await _products.InsertOneAsync(product);
        }
         
        public async Task<List<Product>> GetAllAsync() {
            return await _products.Find(s => true).ToListAsync();
        }

        public async Task<Product> GetProductByIdAsync(Guid id) {
            return await _products.Find(s => s.Id == id).FirstOrDefaultAsync();
        }

        public async Task UpdateAsync(Product product, IClientSessionHandle session) {
            var filter = Builders<Product>.Filter.Eq(p => p.Id, product.Id);
            var update = Builders<Product>.Update
                .Set(p => p.Name, product.Name)
                .Set(p => p.Description, product.Description)
                .Set(p => p.UnitPrice, product.UnitPrice)
                .Set(p => p.Quantity, product.Quantity)
                .Set(p => p.Active, product.Active);

            await _products.UpdateOneAsync(session, filter, update);
        }

    }
}
