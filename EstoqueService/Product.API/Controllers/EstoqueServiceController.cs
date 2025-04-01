using EstoqueService.Application.InputModels;
using EstoqueService.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace EstoqueService.API.Controllers {
    [ApiController]
    [Route("V1/product")]
    public class EstoqueServiceController : ControllerBase {
        private readonly IProductService _productService;
        private readonly ITransactionManager _transactionManager;

        public EstoqueServiceController(IProductService productService, ITransactionManager transactionManager) {
            _productService = productService;
            _transactionManager = transactionManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProduct() {
            var product = await _productService.GetAllAsync();

            if (product == null)
                return NotFound();

            return Ok(product);
        }

        [HttpGet("{idProduct}")]
        public async Task<IActionResult> GetProductById(Guid idProduct) {
            var product = await _productService.GetByIdAsync(idProduct);
            if (product == null) return NotFound();
            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> Post(AddProductInputModel model) {
            try {
                await _transactionManager.StartTransactionAsync();

                var productId = await _productService.AddAsync(model);

                await _transactionManager.CommitAsync();

                return CreatedAtAction(
                        nameof(GetProductById),
                        new { idProduct = productId },
                        new { id = productId }
                );
            }
            catch (Exception ex) {
                await _transactionManager.AbortAsync();
                return StatusCode(500, "Erro: " + ex.Message);
            }
        }

        [HttpPut("{idProduct}")]
        public async Task<IActionResult> Put(Guid idProduct, AddProductInputModel model) {
            try {
                await _transactionManager.StartTransactionAsync();
                var session = _transactionManager.GetSession();

                var updatedProduct = await _productService.UpdateAsync(idProduct, model, session);

                await _transactionManager.CommitAsync();
                return Ok(updatedProduct);

            }
            catch (Exception) {
                await _transactionManager.AbortAsync();
                throw;
            }
        }
    }
}
