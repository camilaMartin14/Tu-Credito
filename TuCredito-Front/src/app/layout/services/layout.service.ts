import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  sidebarOpen = signal<boolean>(true); // Desktop: Expanded by default
  isDarkMode = signal<boolean>(false);

  constructor() {
    // Sync with local storage or system preference could go here
    effect(() => {
      if (this.isDarkMode()) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    });
  }
  
  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  setSidebarState(isOpen: boolean) {
    this.sidebarOpen.set(isOpen);
  }

  toggleTheme() {
    this.isDarkMode.update(v => !v);
  }
}
