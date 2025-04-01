import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ProdutoListComponent } from '../produtos/product-list/product-list.component';
import { NotaListComponent } from '../nota/nota-list/nota-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatTabsModule, ProdutoListComponent, NotaListComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {}
