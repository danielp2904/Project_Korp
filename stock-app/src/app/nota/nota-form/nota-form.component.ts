import {
  Component,
  OnInit,
  Inject,
  Optional,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  MatTableModule,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { Nota, Item } from '../models/nota';
import { NotaService } from '../services/nota.service';
import { Produto } from '../../produtos/models/produto';
import { ProdutoService } from '../../produtos/services/produto.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, of, catchError, Observable } from 'rxjs';

@Component({
  selector: 'app-nota-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatToolbarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatCheckboxModule,
  ],
  templateUrl: './nota-form.component.html',
  styleUrls: ['./nota-form.component.css'],
})
export class NotaFormComponent implements OnInit, AfterViewInit {
  notaForm: FormGroup;
  isLoading = false;
  submitAttempted = false;
  isDialog = false;
  isEditing = false;
  title = 'Cadastro de Nota';

  dataSource = new MatTableDataSource<Produto>();
  displayedColumns: string[] = ['select', 'name', 'unitPrice', 'quantity'];

  selectedProdutos: Map<string, Item> = new Map();

  produtosMap: Map<string, Produto> = new Map();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Produto>;

  get itens(): FormArray {
    return this.notaForm.get('itens') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private notaService: NotaService,
    private produtoService: ProdutoService,
    private snackBar: MatSnackBar,
    private router: Router,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() private dialogRef?: MatDialogRef<NotaFormComponent>
  ) {
    this.notaForm = this.fb.group({
      idNotaFiscal: [null],
      dataEmissao: [new Date()],
      status: [1],
      processada: [false],
      itens: this.fb.array([]),
    });

    if (data && data.isDialog) {
      this.isDialog = true;
    }

    if (data && data.nota) {
      this.isEditing = true;
      this.title = 'Editar Nota';
      this.notaForm.patchValue(data.nota);

      if (data.nota.itens && data.nota.itens.length > 0) {
        data.nota.itens.forEach((item: Item) => {
          this.addItemToForm(item);
          if (item.idProduto) {
            this.selectedProdutos.set(item.idProduto, item);
          }
        });
      }
    }
  }

  ngOnInit(): void {
    if (this.isLoading) {
      this.notaForm.disable();
    } else {
      this.notaForm.enable();
    }

    this.loadProdutos();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadProdutos(): void {
    this.isLoading = true;
    this.produtoService.getProdutos().subscribe({
      next: (produtos) => {
        const validProducts = produtos.filter((p) => p.productId);
        this.dataSource.data = validProducts;

        validProducts.forEach((produto) => {
          if (produto.productId) {
            this.produtosMap.set(produto.productId, produto);
          }
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.showErrorMessage('Erro ao carregar produtos. Tente novamente.');
        this.isLoading = false;
      },
    });
  }

  toggleProdutoSelection(produto: Produto): void {
    if (!produto || !produto.productId) {
      console.error('Produto sem ID válido:', produto);
      this.showErrorMessage('Erro: produto sem ID válido');
      return;
    }

    if (this.selectedProdutos.has(produto.productId)) {
      this.selectedProdutos.delete(produto.productId);

      const index = this.findItemIndexInForm(produto.productId);
      if (index > -1) {
        this.itens.removeAt(index);
      }
    } else {
      if (produto.quantity <= 0) {
        this.showErrorMessage(
          `Produto "${produto.name}" sem estoque disponível.`
        );
        return;
      }

      const item: Item = {
        idProduto: produto.productId,
        nome: produto.name,
        quantidade: 1,
        valorTotal: produto.unitPrice,
      };

      this.selectedProdutos.set(produto.productId, item);
      this.addItemToForm(item);
    }

    if (this.table) {
      this.table.renderRows();
    }
  }

  isSelected(productId: string): boolean {
    if (!productId) {
      return false;
    }

    const selected = this.selectedProdutos.has(productId);
    return selected;
  }

  addItemToForm(item: Item): void {
    const itemGroup = this.fb.group({
      productId: [item.idProduto, Validators.required],
      nome: [item.nome, Validators.required],
      quantidade: [item.quantidade, [Validators.required, Validators.min(1)]],
      valor: [item.valorTotal, [Validators.required, Validators.min(0)]],
    });

    this.itens.push(itemGroup);
  }

  findItemIndexInForm(produtoId: string): number {
    return this.itens.controls.findIndex(
      (control) => control.get('productId')?.value === produtoId
    );
  }

  updateItemQuantity(produtoId: string, quantidade: number): void {
    if (quantidade < 1) return;

    if (!this.hasEnoughStock(produtoId, quantidade)) {
      this.showErrorMessage(
        `Quantidade solicitada (${quantidade}) excede o estoque disponível (${this.getAvailableStock(
          produtoId
        )}).`
      );
      return;
    }

    const item = this.selectedProdutos.get(produtoId);
    if (!item) return;

    item.quantidade = quantidade;
    this.selectedProdutos.set(produtoId, item);

    const index = this.findItemIndexInForm(produtoId);
    if (index > -1) {
      const itemGroup = this.itens.at(index);
      itemGroup.patchValue({
        quantidade: quantidade,
      });
    }
  }

  calculateItemTotal(item: Item): number {
    return item.quantidade * item.valorTotal;
  }

  onSubmit(): void {
    this.submitAttempted = true;

    if (this.itens.length > 0) {
      let hasInsufficientStock = false;
      const itemsToValidate = Array.from(this.selectedProdutos.values());

      for (const item of itemsToValidate) {
        if (item.idProduto) {
          if (!this.hasEnoughStock(item.idProduto, item.quantidade)) {
            this.showErrorMessage(
              `Produto "${item.nome}" tem estoque insuficiente (Pedido: ${
                item.quantidade
              }, Disponível: ${this.getAvailableStock(item.idProduto)}).`
            );
            hasInsufficientStock = true;
            break;
          }
        }
      }

      if (hasInsufficientStock) {
        return;
      }

      this.isLoading = true;

      if (!this.notaForm.get('dataEmissao')?.value) {
        this.notaForm.get('dataEmissao')?.setValue(new Date());
      }

      if (
        this.notaForm.get('status')?.value === null ||
        this.notaForm.get('status')?.value === undefined
      ) {
        this.notaForm.get('status')?.setValue(1);
      }

      const nota: Nota = {
        ...this.notaForm.value,
        itens: itemsToValidate.map((item) => ({
          idProduto: item.idProduto,
          quantidade: item.quantidade,
          valorTotal: item.valorTotal,
        })),
      };

      const stockReductionOperations: Observable<Produto>[] = [];

      itemsToValidate.forEach((item) => {
        if (item.idProduto) {
          stockReductionOperations.push(
            this.produtoService.reduceProductStock(
              item.idProduto,
              item.quantidade
            )
          );
        }
      });

      forkJoin(stockReductionOperations)
        .pipe(
          catchError((error) => {
            console.error('Erro ao reduzir estoque:', error);
            this.showErrorMessage(
              'Erro ao reduzir o estoque dos produtos. Operação cancelada.'
            );
            this.isLoading = false;
            return of([]);
          })
        )
        .subscribe({
          next: (updatedProducts) => {
            console.log('Estoques reduzidos com sucesso:', updatedProducts);

            updatedProducts.forEach((product) => {
              if (product.productId) {
                this.produtosMap.set(product.productId, product);
              }
            });

            const operation = this.isEditing
              ? this.notaService.updateNota(nota, true)
              : this.notaService.addNota(nota);

            operation.subscribe({
              next: (savedNota) => {
                this.showSuccessMessage();
                if (this.isDialog) {
                  this.dialogRef?.close(true);
                } else {
                  this.resetForm();
                  this.loadProdutos();
                }
                this.isLoading = false;
              },
              error: (error) => {
                console.error('Erro ao salvar nota:', error);
                this.showErrorMessage(
                  'Não foi possível salvar a nota. Estoques já foram reduzidos.'
                );
                this.isLoading = false;
              },
            });
          },
          error: (error) => {
            console.error('Erro ao reduzir estoques:', error);
            this.showErrorMessage(
              'Erro ao reduzir o estoque dos produtos. Operação cancelada.'
            );
            this.isLoading = false;
          },
        });
    } else {
      this.showErrorMessage('Selecione pelo menos um produto para a nota');
    }
  }

  hasEnoughStock(productId: string, requestedQuantity: number): boolean {
    const produto = this.produtosMap.get(productId);
    if (!produto) return false;
    return produto.quantity >= requestedQuantity;
  }

  getAvailableStock(productId: string): number {
    const produto = this.produtosMap.get(productId);
    return produto ? produto.quantity : 0;
  }

  onCancel(): void {
    if (this.isDialog) {
      this.dialogRef?.close(false);
    } else {
      this.router.navigate(['/nota']);
    }
  }

  getSelectedProdutosArray(): Item[] {
    return Array.from(this.selectedProdutos.values());
  }

  calculateTotal(): number {
    let total = 0;
    this.selectedProdutos.forEach((item) => {
      total += this.calculateItemTotal(item);
    });
    return total;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue) {
      this.dataSource.filter = filterValue.trim().toLowerCase();
    } else {
      this.dataSource.filter = '';
    }
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  private showSuccessMessage(): void {
    const message = this.isEditing
      ? '✅ Nota atualizada com sucesso!'
      : '✅ Nota cadastrada com sucesso!';

    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(`⚠️ ${message}`, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }

  private resetForm(): void {
    this.submitAttempted = false;
    this.selectedProdutos.clear();
    this.notaForm.reset({
      dataEmissao: new Date(),
      status: 1,
      processada: false,
    });

    while (this.itens.length) {
      this.itens.removeAt(0);
    }
  }
}
