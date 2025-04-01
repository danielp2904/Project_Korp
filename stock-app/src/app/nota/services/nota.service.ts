import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Nota, Item } from '../models/nota';
import { ProdutoService } from '../../produtos/services/produto.service';

@Injectable({
  providedIn: 'root',
})
export class NotaService {
  private apiUrl = 'http://localhost:5000/v1/notas';

  constructor(
    private http: HttpClient,
    private produtoService: ProdutoService
  ) {}

  getNotas(): Observable<Nota[]> {
    return this.http
      .get<Nota[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  
  getNota(id: string): Observable<Nota> {
    return this.http
      .get<Nota>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  addNota(nota: Nota): Observable<Nota> {
    const payload = this.convertToPayload(nota);
    return this.http.post<Nota>(this.apiUrl, payload).pipe(
      tap((savedNota) => {
        // console.log('Nota cadastrada com sucesso:', savedNota);
      }),
      catchError(this.handleError)
    );
  }

  updateNota(nota: Nota, process: boolean = false): Observable<Nota> {
    if (!nota.idNotaFiscal) {
      return throwError(
        () => new Error('ID da nota é obrigatório para atualização.')
      );
    }

    const payload = this.convertToPayload(nota);

    return this.http
      .put<Nota>(
        `${this.apiUrl}/${nota.idNotaFiscal}/${process}`,
        payload
      )
      .pipe(
        tap((updatedNota) => {
          console.log('Nota atualizada com sucesso:', updatedNota);
        }),
        catchError(this.handleError)
      );
  }

  private convertToPayload(nota: Nota): any {
    if (nota.itens && nota.itens.length > 0) {
      return {
        itens: nota.itens.map((item) => {
          return {
            idProduto: item.idProduto,
            quantidade: item.quantidade,
            valorTotal: item.valorTotal * item.quantidade,
          };
        }),
        dataEmissao: nota.dataEmissao,
        processada: nota.processada,
        status: nota.status,
      };
    }
    return {
      itens: [],
      dataEmissao: nota.dataEmissao,
      processada: nota.processada,
      status: nota.status,
    };
  }

  validateStockAvailability(nota: Nota): Observable<boolean> {
    if (!nota.itens || nota.itens.length === 0) {
      return of(true);
    }

    const stockValidations = nota.itens
      .filter((item) => item.idProduto && item.quantidade > 0)
      .map((item) => {
        return this.produtoService.hasEnoughStock(
          item.idProduto!,
          item.quantidade
        );
      });

    return forkJoin(stockValidations).pipe(
      map((results) => results.every((hasStock) => hasStock === true)),
      catchError((error) => {
        console.error('Erro ao validar disponibilidade de estoque:', error);
        return of(false);
      })
    );
  }

  
  private handleError(error: any) {
    console.error('Erro na requisição:', error);
    return throwError(() => error);
  }
}
