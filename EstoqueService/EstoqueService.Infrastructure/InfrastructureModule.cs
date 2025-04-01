using EstoqueService.Core.Repositories;
using EstoqueService.Infrastructure.Persistence;
using EstoqueService.Infrastructure.Persistence.Repositories;
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
            BsonSerializer.RegisterSerializer(typeof(Guid), new GuidSerializer(GuidRepresentation.Standard));

            services.AddSingleton<MongoDbOptions>(sp => {
                var configuration = sp.GetRequiredService<IConfiguration>();
                var options = new MongoDbOptions();
                configuration.GetSection("Mongo").Bind(options);

                if (string.IsNullOrEmpty(options.ConnectionString))
                    throw new InvalidOperationException("ConnectionString não configurada no appsettings.json");

                return options;
            });

            services.AddSingleton<IMongoClient>(sp => {
                var options = sp.GetRequiredService<MongoDbOptions>();

                var settings = MongoClientSettings.FromConnectionString(options.ConnectionString);
                settings.ConnectTimeout = TimeSpan.FromSeconds(45);
                settings.ServerSelectionTimeout = TimeSpan.FromSeconds(60);
                settings.ReplicaSetName = "rs0";
                settings.ReadPreference = ReadPreference.SecondaryPreferred;
                settings.ApplicationName = "EstoqueService";

                return new MongoClient(settings);
            });

            services.AddTransient(sp => {
                var options = sp.GetRequiredService<MongoDbOptions>();
                var client = sp.GetRequiredService<IMongoClient>();
                return client.GetDatabase(options.DatabaseName);
            });

            return services;
        }

        private static IServiceCollection AddRepositories(this IServiceCollection services) {
            services.AddScoped<IProductRepository, ProductRepository>();
            services.AddScoped<ITransactionManager, MongoTransactionManager>();
            return services;
        }
    }
}