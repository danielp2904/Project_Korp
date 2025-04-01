
using FaturamentoService.Core.Entities;
using FaturamentoService.Core.Repositories;
using MongoDB.Driver;

namespace EstoqueService.Infrastructure.Persistence.Repositories {
    public class NotaFiscalRepository : INotaFiscalRepository {
        private readonly IMongoCollection<NotaFiscal> _notaFiscal;
        public NotaFiscalRepository(IMongoDatabase data) {
            _notaFiscal = data.GetCollection<NotaFiscal>("notaFiscal");
        }

        public async Task<List<NotaFiscal>> GetAllAsync() {
            return await _notaFiscal.Find(s => true).ToListAsync();
        }

        public async Task AddAsync(NotaFiscal notaFiscal) {
            await _notaFiscal.InsertOneAsync(notaFiscal);
        }

        public async Task UpdateAsync(NotaFiscal notaFiscal, IClientSessionHandle session) {
            var filter = Builders<NotaFiscal>.Filter.Eq(p => p.Id, notaFiscal.Id);
            var update = Builders<NotaFiscal>.Update
                .Set(p => p.Processada, notaFiscal.Processada)
                .Set(p => p.Status, notaFiscal.Status);

            await _notaFiscal.UpdateOneAsync(session, filter, update);
        }

        public async Task<NotaFiscal> GetByIdAsync(Guid id) {
            return await _notaFiscal.Find(s => s.Id == id).FirstOrDefaultAsync();
        }
    }
}
