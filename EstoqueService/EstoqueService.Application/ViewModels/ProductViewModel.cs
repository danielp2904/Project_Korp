using EstoqueService.Entities;

namespace EstoqueService.Application.ViewModels {
    public class ProductViewModel {
        public ProductViewModel(Guid productId, string name, string description, decimal unitPrice, int quantity, bool active) {
            ProductId = productId;
            Name = name;
            Description = description;
            UnitPrice = unitPrice;
            Quantity = quantity;
            Active = active;
        }

        public Guid ProductId { get; set; }
        public string Name { get; private set; }
        public string Description { get; private set; }
        public decimal UnitPrice { get; private set; }
        public int Quantity { get; private set; }
        public bool Active { get; private set; }

        public static ProductViewModel FromEntity(Product product) {
            return new ProductViewModel(
                product.Id,
                product.Name,
                product.Description,
                product.UnitPrice,
                product.Quantity,
                product.Active
            );
        }
    }
}
