import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableDataSource } from '@angular/material/table';

import { ProdutoService } from '../services/produto.service';
import { Produto } from '../models/produto';
import { ProdutoFormComponent } from '../produto-form/produto-form.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-produto-list',
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
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProdutoListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'name',
    'description',
    'unitPrice',
    'quantity',
    'status',
    'actions',
  ];
  dataSource = new MatTableDataSource<Produto>();

  isLoading = true;
  selectedProdutos: Set<string> = new Set();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Produto>;

  constructor(
    private produtoService: ProdutoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
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
        this.dataSource.data = produtos;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.snackBar.open(
          'Erro ao carregar produtos. Tente novamente.',
          'Fechar',
          {
            duration: 5000,
            panelClass: ['error-snackbar'],
          }
        );
        this.isLoading = false;
      },
    });
  }  

  openNewProdutoDialog(): void {
    const dialogRef = this.dialog.open(ProdutoFormComponent, {
      width: '800px',
      disableClose: true,
      autoFocus: true,
      data: { isDialog: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProdutos();
      }
    });
  }

  editProduto(produto: Produto): void {
    const dialogRef = this.dialog.open(ProdutoFormComponent, {
      width: '800px',
      disableClose: true,
      autoFocus: true,
      data: { produto, isDialog: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProdutos();
      }
    });
  }

  selectProduto(id: string): void {
    if (this.selectedProdutos.has(id)) {
      this.selectedProdutos.delete(id);
    } else {
      this.selectedProdutos.add(id);
    }
  }

  isSelected(id: string): boolean {
    return this.selectedProdutos.has(id);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
