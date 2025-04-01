using FaturamentoService.Application.InputModels;
using FaturamentoService.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace FaturamentoService.API.Controllers {
    [ApiController]
    [Route("V1/notas")]
    public class FaturamentoServiceController : ControllerBase {
        private readonly INotaFiscalService _nota;
        private readonly ITransactionManager _transactionManager;

        public FaturamentoServiceController(INotaFiscalService nota, ITransactionManager transactionManager) {
            _nota = nota;
            _transactionManager = transactionManager;
        }

        [HttpGet("{idNota}")]
        public async Task<IActionResult> GetByIdAsync(Guid idNota) {
            var nota = await _nota.GetByIdAsync(idNota);

            if (nota == null)
                return NotFound();

            return Ok(nota);
        }

        [HttpPost]
        public async Task<IActionResult> Post(AddNotaInputModel nota) {
            try {                
                await _transactionManager.StartTransactionAsync();

                var notaId = await _nota.AddAsync(nota);

                await _transactionManager.CommitAsync();

                return Ok(notaId);
            }
            catch (Exception ex) {
                await _transactionManager.AbortAsync();
                return StatusCode(500, "Erro: " + ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProduct() {
            var product = await _nota.GetAllAsync();

            if (product == null)
                return NotFound();

            return Ok(product);
        }

        [HttpPut("{idNota}/{processar}")]
        public async Task<IActionResult> Put(Guid idNota, bool processar) {
            try {
                await _transactionManager.StartTransactionAsync();
                var session = _transactionManager.GetSession();

                var nota = await _nota.GetByIdAsync(idNota);

                if(nota.Processada && processar) {
                    throw new InvalidOperationException("Nota já processada. Não pode ser modificada.");
                }

                var updatedProduct = await _nota.UpdateAsync(idNota, processar, session);

                await _transactionManager.CommitAsync();
                return Ok(updatedProduct);
            }
            catch (InvalidOperationException ex) {
                await _transactionManager.AbortAsync();
                return BadRequest(new { erro = ex.Message });
            }
            catch (Exception ex) {
                await _transactionManager.AbortAsync();
                return StatusCode(500, "Erro: " + ex.Message);
            }
        }
    }
}
