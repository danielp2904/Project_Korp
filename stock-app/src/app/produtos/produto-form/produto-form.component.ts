import { Component, OnInit, Inject, Optional } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
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

import { Produto } from '../models/produto';
import { ProdutoService } from '../services/produto.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-produto-form',
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
  ],
  templateUrl: './produto-form.component.html',
  styleUrls: ['./produto-form.component.css'],
})
export class ProdutoFormComponent implements OnInit {
  produtoForm: FormGroup;
  isLoading = false;
  submitAttempted = false;
  isDialog = false;
  isEditing = false;
  title = 'Cadastro de Produto';

  constructor(
    private fb: FormBuilder,
    private produtoService: ProdutoService,
    private snackBar: MatSnackBar,
    private router: Router,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() private dialogRef?: MatDialogRef<ProdutoFormComponent>
  ) {
    this.produtoForm = this.fb.group({
      productId: [''],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      active: [true],
    });

    if (data && data.isDialog) {
      this.isDialog = true;
    }

    if (data && data.produto) {
      this.isEditing = true;
      this.title = 'Editar Produto';
      this.produtoForm.patchValue(data.produto);
    }
  }

  ngOnInit(): void {
    if (this.isLoading) {
      this.produtoForm.disable();
    } else {
      this.produtoForm.enable();
    }
  }

  onSubmit(): void {
    this.submitAttempted = true;

    if (this.produtoForm.valid) {
      this.isLoading = true;

      const produto: Produto = {
        ...this.produtoForm.value,
        active: this.produtoForm.get('active')?.value || false,
      };

      const operation = this.isEditing
        ? this.produtoService.updateProduto(produto)
        : this.produtoService.addProduto(produto);

      operation.subscribe({
        next: (savedProduto) => {
          console.log('Produto salvo com sucesso:', savedProduto);
          this.showSuccessMessage();

          if (this.isDialog) {
            this.dialogRef?.close(true);
          } else {
            this.resetForm();
          }
        },
        error: (error) => {
          console.error('Erro ao salvar produto:', error);
          this.showErrorMessage(
            'Não foi possível salvar o produto. Tente novamente.'
          );
          this.isLoading = false;
        },
        complete: () => {
          if (!this.isDialog) {
            this.isLoading = false;
          }
        },
      });
    } else {
      this.showErrorMessage('Por favor, corrija os erros no formulário');
      this.validateAllFormFields(this.produtoForm);
    }
  }

  onCancel(): void {
    if (this.isDialog) {
      this.dialogRef?.close(false);
    } else {
      this.router.navigate(['/produtos']);
    }
  }

  private showSuccessMessage(): void {
    const message = this.isEditing
      ? '✅ Produto atualizado com sucesso!'
      : '✅ Produto cadastrado com sucesso!';

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
    this.produtoForm.reset({
      active: true,
      unitPrice: 0,
      quantity: 0,
    });
  }

  private validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }
}
