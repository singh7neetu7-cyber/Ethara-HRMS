import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="app-layout" [class.sidebar-open]="sidebarOpen">
      <header class="mobile-header">
        <button type="button" class="menu-toggle" (click)="toggleSidebar()" aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div class="mobile-title">HRMS</div>
      </header>
      <app-sidebar [isOpen]="sidebarOpen" (closeSidebar)="closeSidebar()"></app-sidebar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      background: var(--bg);
      position: relative;
    }

    .main-content {
      min-height: 100vh;
      margin-left: var(--sidebar-width);
      width: calc(100% - var(--sidebar-width));
      padding: 2rem;
      overflow-x: hidden;
    }

    .mobile-header {
      display: none;
      position: sticky;
      top: 0;
      z-index: 1100;
      align-items: center;
      gap: 0.75rem;
      height: 64px;
      padding: 0 1rem;
      backdrop-filter: blur(8px);
      background: rgba(8, 18, 38, 0.85);
      border-bottom: 1px solid rgba(82, 120, 255, 0.2);
    }

    .mobile-title {
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      color: var(--text);
    }

    .menu-toggle {
      width: 40px;
      height: 40px;
      border: 1px solid rgba(82, 120, 255, 0.35);
      border-radius: 10px;
      background: rgba(82, 120, 255, 0.12);
      display: grid;
      place-items: center;
      gap: 4px;
      cursor: pointer;
    }

    .menu-toggle span {
      display: block;
      width: 16px;
      height: 2px;
      border-radius: 2px;
      background: var(--text);
    }

    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(56, 189, 248, 0.1);
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(56, 189, 248, 0.4);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(56, 189, 248, 0.6);
    }

    @media (max-width: 1024px) {
      .mobile-header {
        display: flex;
      }

      .main-content {
        margin-left: 0;
        width: 100%;
        padding: 1rem;
        padding-top: calc(64px + 1rem);
      }
    }
  `]
})
export class AppComponent {
  sidebarOpen = false;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}
