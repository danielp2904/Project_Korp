using FaturamentoService.Core.Entities;
using System.ComponentModel.DataAnnotations;

namespace FaturamentoService.Application.InputModels {
    public class AddNotaItemInputModel {
        public Guid IdProduto { get; set; }
        public int Quantidade { get; set; }
        public decimal ValorTotal { get; set; }

        public NotaItem ToEntity()
            => new NotaItem(
                IdProduto,
                Quantidade,
                ValorTotal);
    }
}
