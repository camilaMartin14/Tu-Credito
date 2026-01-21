import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../services/payment.service';
import { PagoOutputDTO } from '../models/payment.models';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments-list.component.html',
  styleUrls: ['./payments-list.component.scss']
})
export class PaymentsListComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private destroyRef = inject(DestroyRef);

  payments = signal<PagoOutputDTO[]>([]);
  filteredPayments = signal<PagoOutputDTO[]>([]);
  searchTerm = '';
  isLoading = signal<boolean>(true);
  
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.loadPayments();
    this.setupSearchSubscription();
  }

  setupSearchSubscription() {
    this.searchSubject.pipe(
      takeUntilDestroyed(this.destroyRef),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(term => {
        this.isLoading.set(true);
        if (!term) {
          return this.paymentService.getAll();
        } else {
          return this.paymentService.filter(term);
        }
      })
    ).subscribe({
      next: (data) => {
        this.filteredPayments.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading payments', err);
        this.isLoading.set(false);
      }
    });
  }

  loadPayments() {
    this.isLoading.set(true);
    this.paymentService.getAll().subscribe({
      next: (data) => {
        this.payments.set(data);
        this.filteredPayments.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading payments', err);
        this.isLoading.set(false);
      }
    });
  }

  applyFilters() {
    this.searchSubject.next(this.searchTerm);
  }

  createNew() {
    // TODO: Implement create payment navigation
    console.log('Create new payment');
  }

  viewDetail(payment: PagoOutputDTO) {
    console.log('View payment', payment);
  }

  getPaymentMethodName(id: number): string {
    const methods: {[key: number]: string} = {
      1: 'Efectivo',
      2: 'Transferencia',
      3: 'Depósito',
      4: 'Cheque'
    };
    return methods[id] || 'Desconocido';
  }
}
