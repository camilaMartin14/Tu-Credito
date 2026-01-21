import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <nav class="sidebar-nav">
        <ul>
          <li>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" [title]="collapsed() ? 'Dashboard' : ''">
              <span class="material-icons-round">dashboard</span>
              <span class="label" *ngIf="!collapsed()">Dashboard</span>
            </a>
          </li>
          <li>
            <a routerLink="/clients" routerLinkActive="active" class="nav-item" [title]="collapsed() ? 'Clientes' : ''">
              <span class="material-icons-round">people</span>
              <span class="label" *ngIf="!collapsed()">Clientes</span>
            </a>
          </li>
          <li>
            <a routerLink="/loans" routerLinkActive="active" class="nav-item" [title]="collapsed() ? 'Préstamos' : ''">
              <span class="material-icons-round">account_balance_wallet</span>
              <span class="label" *ngIf="!collapsed()">Préstamos</span>
            </a>
          </li>
          <li>
            <a routerLink="/payments" routerLinkActive="active" class="nav-item" [title]="collapsed() ? 'Pagos' : ''">
              <span class="material-icons-round">payments</span>
              <span class="label" *ngIf="!collapsed()">Pagos</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
      height: calc(100vh - 80px);
      width: 260px;
      position: fixed;
      top: 80px;
      left: 0;
      z-index: 900;
      transition: width 0.3s ease;
      background-color: var(--color-bg-card, #ffffff);
      border-right: 1px solid var(--color-border, #e0e0e0);
    }

    :host.collapsed {
      width: 80px;
    }

    .sidebar {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar-nav {
      flex: 1;
      padding: 2rem 1rem;
      overflow-y: auto;

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.875rem 1rem;
        border-radius: 12px;
        color: var(--text-secondary, #A3AED0);
        text-decoration: none;
        transition: all 0.2s ease;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        height: 50px;

        .material-icons-round {
          font-size: 24px;
          min-width: 24px;
        }

        &:hover {
          background-color: var(--color-bg-main, #F4F7FE);
          color: var(--text-main, #2B3674);
        }

        &.active {
          background-color: var(--color-primary, #4318FF);
          color: white;
          box-shadow: 0 4px 12px rgba(67, 24, 255, 0.3);
        }
      }
    }
  `],
  host: {
    '[class.collapsed]': 'collapsed()'
  }
})
export class SidebarComponent {
  private layoutService = inject(LayoutService);
  collapsed = computed(() => !this.layoutService.sidebarOpen());
}

