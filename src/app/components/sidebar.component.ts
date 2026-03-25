import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <button
      class="sidebar-backdrop"
      type="button"
      [class.show]="isOpen"
      (click)="closeSidebar.emit()"
      aria-label="Close menu">
    </button>
    <nav class="sidebar" [class.open]="isOpen">
      <div class="sidebar-header">
        <div class="logo-container">
          <span class="logo-icon">E</span>
          <h1>Ethara HRMS</h1>
        </div>
      </div>

      <ul class="nav-menu">
        <li>
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="onNavClick()">
            <span class="icon" style="color: #6366f1;">◉</span>
            <span class="label">Overview</span>
          </a>
        </li>

        <li class="nav-section">
          <span class="section-title">Personnel Management</span>
        </li>

        <li>
          <a routerLink="/employees" routerLinkActive="active" (click)="onNavClick()">
            <span class="icon" style="color: #10b981;">◎</span>
            <span class="label">Workforce Registry</span>
          </a>
        </li>

        <li>
          <a routerLink="/attendance" routerLinkActive="active" (click)="onNavClick()">
            <span class="icon" style="color: #f59e0b;">◍</span>
            <span class="label">Time & Attendance</span>
          </a>
        </li>

        <li>
          <a routerLink="/leaves" routerLinkActive="active" (click)="onNavClick()">
            <span class="icon" style="color: #ec4899;">◐</span>
            <span class="label">Absence Management</span>
          </a>
        </li>

        <li>
          <a routerLink="/departments" routerLinkActive="active" (click)="onNavClick()">
            <span class="icon" style="color: #8b5cf6;">◧</span>
            <span class="label">Organizational Units</span>
          </a>
        </li>

        <li class="nav-section">
          <span class="section-title">Structure</span>
        </li>

        <li>
          <a routerLink="/holidays" routerLinkActive="active" (click)="onNavClick()">
            <span class="icon" style="color: #ef4444;">◓</span>
            <span class="label">Public Holidays</span>
          </a>
        </li>

        <li class="nav-section">
          <span class="section-title">Reporting</span>
        </li>

        <li>
          <a routerLink="/reports" routerLinkActive="active" (click)="onNavClick()">
            <span class="icon" style="color: #06b6d4;">◨</span>
            <span class="label">Performance Insights</span>
          </a>
        </li>
      </ul>

      <div class="sidebar-footer">
        <p>Ethara HRMS v2.0</p>
      </div>
    </nav>
  `,
  styles: [`
    .sidebar-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.4);
      border: 0;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 999;
      backdrop-filter: blur(4px);
    }

    .sidebar-backdrop.show {
      opacity: 1;
      pointer-events: auto;
    }

    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: #f0f7ff;
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 1px 0 10px rgba(0, 0, 0, 0.05);
      border-right: 1px solid #e0eefc;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e0eefc;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      background: #e0f2fe;
      color: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-weight: 800;
      font-size: 1.1rem;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
    }

    .sidebar-header h1 {
      margin: 0;
      color: #1e293b;
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .nav-menu {
      list-style: none;
      padding: 1.5rem 0.9rem;
      margin: 0;
      flex: 1;
    }

    .nav-menu li {
      margin-bottom: 0.35rem;
    }

    .nav-menu a {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.8rem 1rem;
      border-radius: 10px;
      color: #64748b;
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .nav-menu a:hover {
      background: #e1efff;
      color: #0f172a;
      transform: translateX(2px);
    }

    .nav-menu a.active {
      background: #d0e6ff;
      color: #1d4ed8;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      font-weight: 700;
    }

    .nav-section {
      padding: 1.6rem 1rem 0.6rem;
    }

    .section-title {
      font-size: 0.62rem;
      font-weight: 800;
      text-transform: uppercase;
      color: #94a3b8;
      letter-spacing: 0.12em;
    }

    .icon {
      font-size: 1.15rem;
      min-width: 1.6rem;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05));
    }

    .label {
      flex: 1;
    }

    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid #e0eefc;
      text-align: center;
      background: #eaf4ff;
    }

    .sidebar-footer p {
      margin: 0;
      font-size: 0.72rem;
      color: #7a92b1;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    @media (max-width: 1024px) {
      .sidebar {
        width: min(82vw, 300px);
        transform: translateX(-100%);
        transition: transform 0.25s ease;
      }

      .sidebar.open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  onNavClick(): void {
    if (window.innerWidth <= 1024) {
      this.closeSidebar.emit();
    }
  }
}
