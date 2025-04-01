using EstoqueService.Entities;

namespace EstoqueService.Application.InputModels {

    public class AddProductInputModel {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public bool Active { get; set; }

        public Product ToEntity()
            => new Product(Name, Description, UnitPrice, Quantity); 
    }
}
