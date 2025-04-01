using MongoDB.Driver;

public interface ITransactionManager {
    Task StartTransactionAsync();
    Task CommitAsync();
    Task AbortAsync();
    IClientSessionHandle GetSession();
}
