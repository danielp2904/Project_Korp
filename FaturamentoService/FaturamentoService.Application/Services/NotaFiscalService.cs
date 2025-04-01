using FaturamentoService.Application.InputModels;
using FaturamentoService.Application.ViewModels;
using FaturamentoService.Core.Entities;
using FaturamentoService.Core.Repositories;
using MongoDB.Driver;

namespace FaturamentoService.Application.Services {
    public class NotaFiscalService : INotaFiscalService {
        private readonly INotaFiscalRepository _nota;
        public NotaFiscalService(INotaFiscalRepository nota) {
            _nota = nota;
        }

        public async Task<Guid> AddAsync(AddNotaInputModel model) {
            var nota = new NotaFiscal();
            foreach (var item in model.Itens) {
                nota.Adicionar(item.ToEntity());
            }
            await _nota.AddAsync(nota);
            return nota.Id;
        }

        public async Task<List<NotaFiscalViewModel>> GetAllAsync() {
            var products = await _nota.GetAllAsync();

            return products
                .Select(s => NotaFiscalViewModelMapper.FromEntity(s))
                .ToList();
        }

        public async Task<NotaFiscalViewModel> GetByIdAsync(Guid id) {
            var nota = await _nota.GetByIdAsync(id) ?? throw new Exception("Produto não encontrado");
            return NotaFiscalViewModelMapper.FromEntity(nota);
        }

        public async Task<NotaFiscalViewModel> UpdateAsync(Guid id, bool processar, IClientSessionHandle session) {
            var notaFical = await _nota.GetByIdAsync(id)
                ?? throw new Exception("Produto não encontrado");
            
            if (processar) {
                notaFical.Processar();
                await _nota.UpdateAsync(notaFical, session);
            }

            return NotaFiscalViewModelMapper.FromEntity(notaFical);
        }
    }
}
