using EstoqueService.Enums;

namespace EstoqueService.Entities {
    public class Product : EntityBase {

        public Product(string name, string description, decimal unitPrice,int quantity) : base() {
            Name = name;
            Description = description;
            UnitPrice = unitPrice;
            Active = true;
            Quantity = quantity;
            Movements = new List<StockMovement>();
        }

        public string Name { get; set; }
        public string Description { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public bool Active { get; set; }
        public List<StockMovement> Movements { get; private set; }

        public void UpdateQuantity(int newQuantity) {
            Quantity = newQuantity;
        }

        public void ApplyMovement(int quantity, StockMovementType type) {
            var movement = new StockMovement(quantity, type);
            Movements.Add(movement);
        }
    }
}
