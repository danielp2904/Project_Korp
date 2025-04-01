import { Component, OnInit, ViewChild, AfterViewInit, Optional } from '@angular/core';
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
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import {jsPDF} from 'jspdf';
import {autoTable} from 'jspdf-autotable';

import { NotaService } from '../services/nota.service';
import { ProdutoService } from '../../produtos/services/produto.service';
import { Nota } from '../models/nota';
import { NotaFormComponent } from '../nota-form/nota-form.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-nota-list',
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
  templateUrl: './nota-list.component.html',
  styleUrls: ['./nota-list.component.css'],
})
export class NotaListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'dataEmissao',
    'processada',
    'status',
    'actions',
  ];
  dataSource: Nota[] = [];
  isDialog = false;
  filteredData: Nota[] = [];
  filterValue = '';
  isLoading = true;
  selectedNota: Set<string> = new Set();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Nota>;

  constructor(
    private notaService: NotaService,
    private produtoService: ProdutoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Optional() private dialogRef?: MatDialogRef<NotaListComponent>
  ) {}

  ngOnInit(): void {
    this.loadNotas();
  }

  openNewNotaDialog(): void {
    const dialogRef = this.dialog.open(NotaFormComponent, {
      width: '800px',
      disableClose: true,
      autoFocus: true,
      data: { isDialog: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadNotas();
      }
    });
  }

  ngAfterViewInit(): void {}

  loadNotas(): void {
    this.isLoading = true;
    this.notaService.getNotas().subscribe({
      next: (notas) => {
        this.dataSource = notas;
        this.filteredData = notas;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar notas:', error);
        this.snackBar.open(
          'Erro ao carregar notas. Tente novamente.',
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


  imprimirNota(nota: Nota): void {
    this.notaService.updateNota(nota, true).subscribe({
      next: async (respostaAtualizada) => {
        for (const item of respostaAtualizada.itens) {
          console.log(item.idProduto);
          const produto = await lastValueFrom(this.produtoService.getProduto(item.idProduto));
          item.nome = produto.name;
        }
  
        this.getPDF(respostaAtualizada);
        this.showSuccessMessage();
  
        if (this.isDialog) {
          this.dialogRef?.close(true);
        } else {
          this.loadNotas();
        }
      },
      error: (erro) => {        
        this.showErrorMessage('Erro ao baixar nota.');
      }
    });
  }
  
  
  showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
  

  private showSuccessMessage(): void {
    const message = '✅ Produto atualizado com sucesso!'

    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
    });
  }


  selectProduto(id: string): void {
    if (this.selectedNota.has(id)) {
      this.selectedNota.delete(id);
    } else {
      this.selectedNota.add(id);
    }
  }

  isSelected(id: string): boolean {
    return this.selectedNota.has(id);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  getPDF(nota: Nota): void{
    const doc = new jsPDF();
  
    doc.setFontSize(16);
    doc.text('Nota Fiscal', 10, 10);

    doc.setFontSize(12);
    const dataFormatada = nota.dataEmissao
      ? new Date(nota.dataEmissao).toLocaleDateString('pt-BR')
      : 'N/A';
  
    doc.text(`Nota ID: ${nota.idNotaFiscal || 'N/A'}`, 10, 20);
    doc.text(`Data de Emissão: ${dataFormatada}`, 10, 28);
    doc.text(`Status: ${nota.status == 2 ? 'Fechado' : 'Aberto'}`, 10, 36);
    doc.text(`Processado: ${nota.processada ? 'Sim' : 'Não'}`, 10, 44);

    const itemData = nota.itens.map((item, index) => [
      index + 1,
      item.nome,
      item.quantidade,
      `R$ ${item.valorTotal.toFixed(2)}`,
    ]);
  
    autoTable(doc, {
      head: [['#', 'Produto', 'Quantidade', 'Valor']],
      body: itemData,
      startY: 55,
    });
  
    doc.save(`nota-${nota.idNotaFiscal || 'sem-id'}.pdf`);
  }

}
