using EstoqueService.Enums;

namespace EstoqueService.Entities {
    public class StockMovement : EntityBase {

        public StockMovement( int quantityChanged, StockMovementType type) : base() {             
            QuantityChanged = quantityChanged;
            Type = type;
            MovementDate = DateTime.Now;
        }
        
        public int QuantityChanged { get; private set; }
        public StockMovementType Type { get; set; }
        public DateTime MovementDate { get; private set; }    }
}
