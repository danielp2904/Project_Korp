using EstoqueService.Infrastructure.Persistence;
using MongoDB.Driver;

public class MongoTransactionManager : ITransactionManager {
    public MongoTransactionManager(IMongoClient mongoClient, MongoDbOptions options) {
        _mongoClient = mongoClient;
        _options = options;
    }

    private readonly IMongoClient _mongoClient;
    private readonly MongoDbOptions _options;
    private IClientSessionHandle _session;

    public async Task StartTransactionAsync() {
        _session = await _mongoClient.StartSessionAsync();
        _session.StartTransaction();
    }

    public async Task CommitAsync() {
        await _session.CommitTransactionAsync();
    }

    public async Task AbortAsync() {
        await _session.AbortTransactionAsync();
    }

    public IClientSessionHandle GetSession() {
        return _session;
    }
}
