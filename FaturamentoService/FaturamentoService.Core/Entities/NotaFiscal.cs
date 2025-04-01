using FaturamentoService.Core.Enums;

namespace FaturamentoService.Core.Entities {
    public class NotaFiscal : EntityBase {

        public NotaFiscal() : base() {
            DataEmissao = DateTime.Now;
            Itens = new List<NotaItem>();
            Processada = false;
            Status = StatusNotaFical.Aberta;
        }

        public DateTime DataEmissao { get; private set; }
        public List<NotaItem> Itens { get; private set; }
        public bool Processada { get; private set; }
        public StatusNotaFical Status {  get; private set; }

        public void Adicionar(NotaItem item) {
            Itens.Add(item);
        }

        public void Processar() {
            Processada = true;
            DataEmissao = DateTime.Now;
            Status = StatusNotaFical.Fechada;
        }
    }
}
