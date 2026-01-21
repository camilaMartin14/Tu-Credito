import { Component, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <div class="layout-wrapper">
      <app-navbar></app-navbar>
      
      <div class="main-body" [style.padding-left]="contentPaddingLeft()">
        <app-sidebar></app-sidebar>
        
        <main class="content-wrapper">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      min-height: 100vh;
      background: transparent;
    }

    .main-body {
      padding-top: 80px; /* Navbar height */
      transition: padding-left 0.3s ease;
      min-height: 100vh;
      box-sizing: border-box;
    }

    .content-wrapper {
      padding: 2rem;
      max-width: 1600px;
      margin: 0 auto;
      
      @media (max-width: 768px) {
        padding: 1rem;
      }
    }
  `]
})
export class MainLayoutComponent {
  private layoutService = inject(LayoutService);
  
  contentPaddingLeft = computed(() => {
    return this.layoutService.sidebarOpen() ? '260px' : '80px';
  });
}

