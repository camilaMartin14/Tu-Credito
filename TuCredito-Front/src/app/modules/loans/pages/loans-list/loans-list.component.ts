import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../services/loan.service';
import { PrestamoDTO } from '../models/loan.models';

@Component({
  selector: 'app-loans-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './loans-list.component.html',
  styleUrls: ['./loans-list.component.scss']
})
export class LoansListComponent implements OnInit {
  private loanService = inject(LoanService);
  private route = inject(ActivatedRoute);

  loans = signal<PrestamoDTO[]>([]);
  filteredLoans = signal<PrestamoDTO[]>([]);
  
  searchTerm = '';
  statusFilter: number | null = null;

  ngOnInit() {
    this.loadLoans();
    
    // Check query params for filters
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        const statusMap: Record<string, number> = {
          'mora': 4,
          'activo': 2,
          'pagado': 3
        };
        this.statusFilter = statusMap[params['status']] || null;
        this.applyFilters();
      }
    });
  }

  loadLoans() {
    this.loanService.getAll().subscribe({
      next: (data) => {
        this.loans.set(data);
        this.applyFilters();
      },
      error: (err) => console.error('Error loading loans', err)
    });
  }

  applyFilters() {
    let result = this.loans();

    if (this.statusFilter) {
      result = result.filter(l => l.idEstado === this.statusFilter);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(l => 
        l.nombrePrestatario.toLowerCase().includes(term) || 
        l.dniPrestatario.toString().includes(term)
      );
    }

    this.filteredLoans.set(result);
  }

  getStatusName(id: number): string {
    const names: Record<number, string> = {
      1: 'Pendiente',
      2: 'Activo',
      3: 'Pagado',
      4: 'En Mora',
      5: 'Rechazado'
    };
    return names[id] || 'Desconocido';
  }

  getStatusClass(id: number): string {
    const classes: Record<number, string> = {
      1: 'pending',
      2: 'active',
      3: 'paid',
      4: 'overdue',
      5: 'rejected'
    };
    return classes[id] || '';
  }
}
