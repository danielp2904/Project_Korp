using EstoqueService.Entities;
using MongoDB.Driver;

namespace EstoqueService.Infrastructure.Persistence {

    public class DbSeed {
        private readonly IMongoCollection<Product> _collection;
        public DbSeed(IMongoDatabase database) {
            _collection = database.GetCollection<Product>("product");
        }

        private readonly List<Product> _product = [
            new Product("Wireless Mouse", "Ergonomic mouse with Bluetooth connectivity", 19.99m,10),
            new Product("Portable Charger", "10,000mAh power bank with fast charging", 24.50m,20),
            new Product("LED Desk Lamp", "Adjustable brightness lamp with USB port", 14.75m,15),
        ];

        public void Populate() {
            if (_collection.CountDocuments(c => true) == 0)
                _collection.InsertMany(_product);
        }
    }
}
