export interface Item {
  idProduto: string;
  nome: string;
  quantidade: number;
  valorTotal: number;
}

export interface Nota {
  idNotaFiscal?: string;
  dataEmissao?: Date;
  itens: Item[];
  processada: boolean;
  status: number;
}
