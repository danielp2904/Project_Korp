namespace FaturamentoService.Core.Entities {
    public class NotaItem : EntityBase {

        public NotaItem(Guid idProduto, int quantidade,decimal valorTotal) :base() {
            IdProduto = idProduto;
            Quantidade = quantidade;
            ValorTotal = valorTotal;
        }

        public Guid IdProduto { get; private set; }
        public int Quantidade { get; private set; }
        public decimal ValorTotal { get; private set; }
    }
}
