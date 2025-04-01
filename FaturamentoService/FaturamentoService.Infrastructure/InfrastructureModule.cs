using EstoqueService.Infrastructure.Persistence;
using EstoqueService.Infrastructure.Persistence.Repositories;
using FaturamentoService.Core.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;
using System;

namespace EstoqueService.Infrastructure {
    public static class InfrastructureModule {
        public static IServiceCollection AddInfra(this IServiceCollection services) {
            services.AddMongo().AddRepositories();
            return services;
        }

        public static IServiceCollection AddMongo(this IServiceCollection services) {
            services.AddSingleton<MongoDbOptions>(sp => {
                var configuration = sp.GetRequiredService<IConfiguration>();
                var options = new MongoDbOptions();
                configuration.GetSection("Mongo").Bind(options);
                return options;
            });

            services.AddSingleton<IMongoClient>(sp => {
                var options = sp.GetRequiredService<MongoDbOptions>();

                BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));

                var settings = MongoClientSettings.FromConnectionString(options.ConnectionString);

                var client = new MongoClient(settings);
                var db = client.GetDatabase(options.DatabaseName);

                var dbSeed = new DbSeed(db);
                dbSeed.Populate();

                return client;
            });

            services.AddTransient(sp => {
                var options = sp.GetRequiredService<MongoDbOptions>();
                var mongoClient = sp.GetRequiredService<IMongoClient>();
                return mongoClient.GetDatabase(options.DatabaseName);
            });

            return services;
        }

        private static IServiceCollection AddRepositories(this IServiceCollection services) {
            services.AddScoped<INotaFiscalRepository, NotaFiscalRepository>();
            services.AddScoped<ITransactionManager, MongoTransactionManager>();
            return services;
        }
    }
}
