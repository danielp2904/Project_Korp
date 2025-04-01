using FaturamentoService.Core.Entities;
using MongoDB.Driver;

namespace EstoqueService.Infrastructure.Persistence {

    public class DbSeed {
        private readonly IMongoCollection<NotaFiscal> _collection;
        public DbSeed(IMongoDatabase database) {
            _collection = database.GetCollection<NotaFiscal>("notaFiscal");
        }

        private readonly List<NotaFiscal> _notaFiscal = [
            new NotaFiscal(),
            new NotaFiscal(),
            new NotaFiscal()
        ];

        public void Populate() {
            if (_collection.CountDocuments(c => true) == 0)
                _collection.InsertMany(_notaFiscal);
        }
    }
}
