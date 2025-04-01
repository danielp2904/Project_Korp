using FaturamentoService.Core.Enums;

namespace FaturamentoService.Application.ViewModels {
    public class NotaFiscalViewModel {

        public Guid IdNotaFiscal { get; set; }
        public DateTime DataEmissao {  get; set; }
        public bool Processada { get; set; }   
        public StatusNotaFical Status {  get; set; }

        public List<NotaItemViewModel> Itens { get; set; } = new();
    }
}
