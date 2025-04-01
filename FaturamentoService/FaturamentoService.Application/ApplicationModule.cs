using FaturamentoService.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace EstoqueService.Application {
    public static class ApplicationModule {
        public static IServiceCollection AddApplication(this IServiceCollection services) {
            services.AddApplicationServices();
            return services;
        }

        private static IServiceCollection AddApplicationServices(this IServiceCollection services) {
            services.AddScoped<INotaFiscalService, NotaFiscalService>();
            return services;
        }
    }
}
