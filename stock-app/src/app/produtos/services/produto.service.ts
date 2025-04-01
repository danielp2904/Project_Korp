import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Produto } from '../models/produto';

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private apiUrl = 'http://localhost:5001/v1/product';

  constructor(private http: HttpClient) {}

  getProduto(id: string): Observable<Produto> {
    return this.http
      .get<Produto>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getProdutos(): Observable<Produto[]> {
    return this.http
      .get<Produto[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  addProduto(produto: Produto): Observable<Produto> {
    return this.http
      .post<Produto>(this.apiUrl, produto)
      .pipe(catchError(this.handleError));
  }

  updateProduto(produto: Produto): Observable<Produto> {
    if (!produto.productId) {
      return throwError(
        () => new Error('ID do produto é obrigatório para atualização.')
      );
    }
    return this.http
      .put<Produto>(`${this.apiUrl}/${produto.productId}`, produto)
      .pipe(catchError(this.handleError));
  }

  reduceProductStock(productId: string, amount: number): Observable<Produto> {
    if (!productId) {
      return throwError(
        () => new Error('ID do produto é obrigatório para redução de estoque.')
      );
    }

    if (amount <= 0) {
      return throwError(
        () => new Error('Quantidade a reduzir deve ser maior que zero.')
      );
    }

    return this.getProduto(productId).pipe(
      switchMap((produto) => {
        if (produto.quantity < amount) {
          return throwError(
            () =>
              new Error(
                `Estoque insuficiente. Disponível: ${produto.quantity}, Solicitado: ${amount}`
              )
          );
        }

        const newQuantity = produto.quantity - amount;
        const updatedProduto: Produto = {
          ...produto,
          quantity: newQuantity,
        };

        return this.updateProduto(updatedProduto);
      }),
      catchError(this.handleError)
    );
  }

  hasEnoughStock(
    productId: string,
    requiredAmount: number
  ): Observable<boolean> {
    if (!productId) {
      return throwError(
        () =>
          new Error('ID do produto é obrigatório para verificação de estoque.')
      );
    }

    return this.getProduto(productId).pipe(
      map((produto) => produto.quantity >= requiredAmount),
      catchError((error) => {
        console.error('Erro ao verificar estoque:', error);
        return of(false);
      })
    );
  }

  getAvailableStock(productId: string): Observable<number> {
    if (!productId) {
      return throwError(
        () =>
          new Error('ID do produto é obrigatório para verificação de estoque.')
      );
    }

    return this.getProduto(productId).pipe(
      map((produto) => produto.quantity),
      catchError((error) => {
        console.error('Erro ao obter estoque disponível:', error);
        return of(0);
      })
    );
  }

  private handleError(error: any) {
    console.error('Erro na requisição:', error);
    return throwError(() => error);
  }
}
