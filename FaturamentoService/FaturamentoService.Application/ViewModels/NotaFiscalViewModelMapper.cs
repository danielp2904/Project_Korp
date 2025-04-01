using FaturamentoService.Core.Entities;

namespace FaturamentoService.Application.ViewModels {
    public class NotaFiscalViewModelMapper {
        public static NotaFiscalViewModel FromEntity(NotaFiscal nota) {
            return new NotaFiscalViewModel {
                IdNotaFiscal = nota.Id,
                DataEmissao = nota.DataEmissao,
                Processada = nota.Processada,
                Status = nota.Status,
                Itens = nota.Itens.Select(i => new NotaItemViewModel {
                    IdProduto = i.IdProduto,
                    Quantidade = i.Quantidade,
                    ValorTotal = i.ValorTotal
                }).ToList()
            };
        }
    }
}
