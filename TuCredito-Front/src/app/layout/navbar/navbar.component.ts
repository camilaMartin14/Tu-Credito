import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="navbar">
      <div class="navbar-left">
        <div class="logo-area">
          <div class="logo-icon">TC</div>
          <h1 class="app-name">TuCrédito</h1>
        </div>
        <button class="btn-icon toggle-sidebar" (click)="toggleSidebar()">
          <span class="material-icons-round">menu</span>
        </button>
      </div>

      <div class="navbar-right">
        <button class="btn-icon" (click)="toggleTheme()">
          <span class="material-icons-round">{{ layoutService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</span>
        </button>
        
        <div class="user-profile" (click)="toggleProfileMenu()">
          <div class="avatar">
            <span>{{ getUserInitials() }}</span>
          </div>
          <span class="user-name">{{ getUserName() }}</span>
          <span class="material-icons-round chevron">expand_more</span>
          
          <!-- Dropdown Menu -->
          <div class="profile-dropdown" *ngIf="isProfileMenuOpen()" (click)="$event.stopPropagation()">
            <div class="dropdown-header">
              <p class="name">{{ getUserName() }}</p>
              <p class="email">{{ getUserEmail() }}</p>
            </div>
            <div class="dropdown-body">
              <a routerLink="/profile" class="dropdown-item">
                <span class="material-icons-round">person</span>
                Mi Perfil
              </a>
              <button class="dropdown-item logout" (click)="logout()">
                <span class="material-icons-round">logout</span>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
    
    <!-- Backdrop for closing dropdown -->
    <div class="backdrop" *ngIf="isProfileMenuOpen()" (click)="closeProfileMenu()"></div>
  `,
  styles: [`
    .navbar {
      height: 80px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2rem;
      background-color: var(--color-bg-card, #ffffff);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.02);

      
      .page-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-main, #2B3674);
        margin: 0;
      }
      
      .navbar-right {
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }
    }

    .btn-icon {
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border-subtle);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      cursor: pointer;
      box-shadow: var(--shadow-card);
      transition: all 0.2s;
      
      &:hover {
        color: var(--color-primary);
        transform: translateY(-2px);
        background: var(--color-bg-card);
      }
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 30px;
      background: var(--color-bg-elevated);
      padding-right: 1rem;
      box-shadow: var(--shadow-card);
      position: relative;
      transition: all 0.2s;
      border: 1px solid var(--color-border-subtle);
      
      &:hover {
        background-color: var(--color-bg-card);
      }

      .avatar {
        width: 36px;
        height: 36px;
        background: var(--gradient-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 0.9rem;
      }
      
      .user-name {
        font-weight: 600;
        color: var(--text-main);
        font-size: 0.9rem;
      }
      
      .chevron {
        color: var(--text-secondary);
        font-size: 1.2rem;
      }
    }

    .profile-dropdown {
      position: absolute;
      top: 120%;
      right: 0;
      width: 240px;
      background: var(--color-bg-card);
      border-radius: 16px;
      box-shadow: var(--shadow-card);
      overflow: hidden;
      z-index: 1001;
      animation: slideDown 0.2s ease-out;
      border: 1px solid var(--color-border-subtle);
      
      .dropdown-header {
        padding: 1.5rem;
        border-bottom: 1px solid var(--color-border-subtle);
        
        .name {
          font-weight: 700;
          color: var(--text-main);
          margin: 0 0 0.25rem 0;
        }
        
        .email {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0;
        }
      }
      
      .dropdown-body {
        padding: 0.5rem;
      }
      
      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        width: 100%;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        font-weight: 500;
        cursor: pointer;
        border-radius: 8px;
        text-decoration: none;
        font-size: 0.9rem;
        
        &:hover {
          background-color: var(--color-bg-elevated);
          color: var(--color-primary);
        }
        
        &.logout {
          color: var(--color-danger);
          &:hover {
            background-color: var(--color-danger-light);
          }
        }
      }
    }

    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: transparent;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class NavbarComponent {
  private authService = inject(AuthService);
  public layoutService = inject(LayoutService);
  
  isProfileMenuOpen = signal<boolean>(false);

  toggleSidebar() {
    this.layoutService.toggleSidebar();
  }

  toggleTheme() {
    this.layoutService.toggleTheme();
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen.update(v => !v);
  }

  closeProfileMenu() {
    this.isProfileMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.closeProfileMenu();
  }

  getUserName(): string {
    const user = this.authService.currentUser();
    return user ? `${user.nombre} ${user.apellido}` : 'Usuario';
  }

  getUserEmail(): string {
    const user = this.authService.currentUser();
    return user?.correo || '';
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (user && user.nombre && user.apellido) {
      return (user.nombre.charAt(0) + user.apellido.charAt(0)).toUpperCase();
    }
    return 'U';
  }
}
