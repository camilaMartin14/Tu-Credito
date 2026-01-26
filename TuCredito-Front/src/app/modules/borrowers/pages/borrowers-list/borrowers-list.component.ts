import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BorrowerService } from '../services/borrower.service';
import { PrestatarioDTO } from '../models/borrower.models';

@Component({
  selector: 'app-borrowers-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './borrowers-list.component.html',
  styleUrls: ['./borrowers-list.component.scss']
})
export class BorrowersListComponent implements OnInit {
  private borrowerService = inject(BorrowerService);
  private router = inject(Router);

  borrowers = signal<PrestatarioDTO[]>([]);
  filteredBorrowers = signal<PrestatarioDTO[]>([]);
  searchTerm = '';
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadBorrowers();
  }

  loadBorrowers() {
    this.isLoading.set(true);
    this.borrowerService.getAll().subscribe({
      next: (data) => {
        this.borrowers.set(data);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading borrowers', err);
        this.isLoading.set(false);
      }
    });
  }

  applyFilters() {
    let result = this.borrowers();

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(b => 
        (b.nombre?.toLowerCase().includes(term) ?? false) || 
        (b.apellido?.toLowerCase().includes(term) ?? false) || 
        (b.dni?.toString().includes(term) ?? false)
      );
    }

    this.filteredBorrowers.set(result);
  }

  createNew() {
    this.router.navigate(['/clients/new']);
  }

  editClient(client: PrestatarioDTO) {
    if (client.dni) {
      this.router.navigate(['/clients/edit', client.dni]);
    }
  }

  toggleStatus(client: PrestatarioDTO) {
    if (!client.dni) return;
    
    const newStatus = !client.esActivo;
    // Optimistic update
    this.updateLocalStatus(client.dni, newStatus);

    this.borrowerService.changeStatus(client.dni, newStatus).subscribe({
      error: (err) => {
        console.error('Error changing status', err);
        // Revert on error
        this.updateLocalStatus(client.dni!, !newStatus);
      }
    });
  }

  private updateLocalStatus(dni: number, status: boolean) {
    this.borrowers.update(list => 
      list.map(b => b.dni === dni ? { ...b, esActivo: status } : b)
    );
    this.applyFilters();
  }
}
