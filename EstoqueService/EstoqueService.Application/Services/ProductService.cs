using EstoqueService.Application.InputModels;
using EstoqueService.Application.ViewModels;
using EstoqueService.Core.Repositories;
using EstoqueService.Enums;
using MongoDB.Driver;
using System;

namespace EstoqueService.Application.Services {
    public class ProductService : IProductService {

        private readonly IProductRepository _productRepository;

        public ProductService(IProductRepository productRepository) {
            _productRepository = productRepository;
        }

        public async Task<Guid> AddAsync(AddProductInputModel productInputModel) {
            var product = productInputModel.ToEntity();
            product.ApplyMovement(product.Quantity, StockMovementType.Entry);
            await _productRepository.AddAsync(product);
            return product.Id;
        }

        public async Task<List<ProductViewModel>> GetAllAsync() {
            var products = await _productRepository.GetAllAsync();

            return products
                .Select(s => ProductViewModel.FromEntity(s))
                .ToList();
        }

        public async Task<ProductViewModel> GetByIdAsync(Guid id) {
            var product = await _productRepository.GetProductByIdAsync(id) ?? throw new Exception("Produto não encontrado");
            return ProductViewModel.FromEntity(product);
        }

        public async Task<ProductViewModel> UpdateAsync(Guid productId, AddProductInputModel productInputModel, IClientSessionHandle session) {
            var product = await _productRepository.GetProductByIdAsync(productId)
                ?? throw new Exception("Produto não encontrado");

            product.Name = productInputModel.Name;
            product.Description = productInputModel.Description;
            product.UnitPrice = productInputModel.UnitPrice;
            product.Active = productInputModel.Active; 

            if (product.Quantity != productInputModel.Quantity) {
                product.UpdateQuantity(productInputModel.Quantity);
                product.ApplyMovement(product.Quantity, StockMovementType.Entry);
            }

            await _productRepository.UpdateAsync(product, session);

            return ProductViewModel.FromEntity(product);
        }
    }
}
