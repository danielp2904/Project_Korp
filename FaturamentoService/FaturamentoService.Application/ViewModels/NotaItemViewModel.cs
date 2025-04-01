namespace FaturamentoService.Application.ViewModels {
    public class NotaItemViewModel {
        public Guid IdProduto { get; set; }
        public int Quantidade { get; set; }
        public Decimal ValorTotal { get; set; }
    }
}