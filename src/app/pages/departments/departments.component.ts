import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Department } from '../../services/api.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">

      <h1>🏭 Organizational Units</h1>
        <div class="header-actions">
           <button (click)="seedSampleDepartments()" class="btn btn-secondary" *ngIf="departments.length === 0">📂 Seed Sample Depts</button>
           <button (click)="toggleNewDeptForm()" class="btn btn-primary">+ Add Unit</button>
        </div>
      </div>

      <div class="grid-layout">
        <!-- Main List -->
        <div class="card main-card">
          <div class="card-header">
            <h2>Registry of Units</h2>
            <span class="count-badge">{{ departments.length }} Units</span>
          </div>

          @if (departments.length === 0) {
            <div class="empty-state">
              <p>No organizational units found. Use "Seed Samples" to quickly add some.</p>
              <button (click)="seedSampleDepartments()" class="btn btn-secondary btn-sm">Seed Samples</button>
            </div>
          } @else {
            <div class="dept-list">
              @for (dept of departments; track dept.id) {
                <div class="dept-item" [ngStyle]="getDeptStyles(dept.name)">
                  <div class="dept-icon" [style.background]="'rgba(255,255,255,0.5)'">{{ dept.name.charAt(0) }}</div>
                  <div class="dept-info">
                    <h3 style="color: inherit;">{{ dept.name }}</h3>
                    <p style="color: inherit; opacity: 0.8;">{{ dept.description || 'No description provided' }}</p>
                  </div>
                  <div class="dept-actions">
                    <button (click)="editDept(dept)" class="icon-btn edit" title="Edit">✎</button>
                    <button (click)="deleteDept(dept.id)" class="icon-btn delete" title="Delete">×</button>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Action Panel -->
        <div class="side-panel">
          @if (showNewDeptForm || editingDept) {
            <div class="card form-card">
              <h2>{{ editingDept ? 'Modify' : 'Create' }} Unit</h2>
              <form (ngSubmit)="editingDept ? submitEditDept() : submitNewDept()" class="form-grid">
                <div class="form-group">
                  <label>Unit Name</label>
                  @if (editingDept) {
                    <input type="text" [(ngModel)]="editingDept.name" name="name" required>
                  } @else {
                    <input type="text" [(ngModel)]="newDept.name" name="name" required placeholder="e.g. Engineering">
                    <div class="suggestions">
                      <span (click)="newDept.name='IT'" class="suggestion-chip">IT</span>
                      <span (click)="newDept.name='Sales'" class="suggestion-chip">Sales</span>
                      <span (click)="newDept.name='HR'" class="suggestion-chip">HR</span>
                      <span (click)="newDept.name='Finance'" class="suggestion-chip">Finance</span>
                    </div>
                  }
                </div>
                <div class="form-group">
                  <label>Description</label>
                  @if (editingDept) {
                    <textarea [(ngModel)]="editingDept.description" name="description" rows="3"></textarea>
                  } @else {
                    <textarea [(ngModel)]="newDept.description" name="description" rows="3"></textarea>
                  }
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-success">{{ editingDept ? 'Save Changes' : 'Confirm Creation' }}</button>
                  <button type="button" (click)="cancelForm()" class="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 0;
      min-height: 100vh;
      color: var(--text);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0;
      color: var(--text);
      font-size: 1.8rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .grid-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 1.5rem;
    }

    .card {
      background: var(--bg-card);
      padding: 1.75rem;
      border-radius: 16px;
      box-shadow: var(--shadow);
      border: 1px solid #e0eefc;
      backdrop-filter: blur(12px);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.75rem;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 1rem;
    }

    .card h2 {
      margin: 0;
      color: var(--text);
      font-size: 1.2rem;
      font-weight: 800;
    }

    .count-badge {
      background: #e0eefc;
      color: #1d4ed8;
      padding: 0.25rem 0.75rem;
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 800;
    }

    .dept-list {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    .dept-item {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dept-item:hover {
      background: #f0f7ff;
      border-color: #d0e6ff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
    }

    .dept-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      font-weight: 900;
      font-size: 1.3rem;
      flex-shrink: 0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .dept-info {
      flex: 1;
    }

    .dept-info h3 {
      margin: 0 0 0.2rem 0;
      color: #1e293b;
      font-size: 1.05rem;
      font-weight: 700;
    }

    .dept-info p {
      margin: 0;
      color: #64748b;
      font-size: 0.88rem;
      line-height: 1.5;
    }

    .dept-actions {
      display: flex;
      gap: 0.4rem;
    }

    .icon-btn {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 1.1rem;
      cursor: pointer;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .icon-btn.edit:hover { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
    .icon-btn.delete:hover { background: #fef2f2; border-color: #fecaca; color: #991b1b; }

    /* Form Styles */
    .side-panel {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group label {
      display: block;
      font-size: 0.72rem;
      font-weight: 800;
      color: #64748b;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .form-group input, .form-group textarea {
      width: 100%;
      padding: 0.8rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      color: #0f172a;
      outline: none;
      font-size: 0.95rem;
      transition: all 0.2s;
    }

    .form-group input:focus, .form-group textarea:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    .suggestions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.6rem;
      flex-wrap: wrap;
    }

    .suggestion-chip {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 0.3rem 0.6rem;
      border-radius: 8px;
      font-size: 0.7rem;
      color: #475569;
      cursor: pointer;
      font-weight: 700;
      transition: all 0.2s;
    }

    .suggestion-chip:hover {
      background: #e0eefc;
      color: #1d4ed8;
      border-color: #d0e6ff;
    }

    .btn {
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 700;
      transition: all 0.2s;
      font-size: 0.92rem;
    }

    .btn-primary { 
      background: linear-gradient(135deg, #3b82f6, #2563eb); 
      color: #fff;
      box-shadow: 0 4px 6px -1px rgba(211, 224, 254, 0.2);
    }
    
    .btn-secondary { 
      background: #f1f5f9; 
      color: #c1d9fb;
      border: 1px solid #e2e8f0;
    }
    
    .btn-success { 
      background: #10b981; 
      color: #fff; 
      width: 100%;
      box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
    }

    .empty-state { text-align: center; padding: 3rem 1rem; color: #64748b; font-style: italic; }

    @media (max-width: 1200px) {
      .grid-layout { grid-template-columns: 1fr; }
      .side-panel { max-width: 500px; }
    }
  `]
})
export class DepartmentsComponent implements OnInit {
  departments: Department[] = [];
  showNewDeptForm = false;
  editingDept: Department | null = null;

  newDept = {
    name: '',
    description: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.api.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
      }
    });
  }

  toggleNewDeptForm() {
    this.showNewDeptForm = !this.showNewDeptForm;
    this.editingDept = null;
  }

  submitNewDept() {
    this.api.addDepartment(this.newDept).subscribe({
      next: () => {
        this.loadDepartments();
        this.showNewDeptForm = false;
        this.newDept = { name: '', description: '' };
      }
    });
  }

  editDept(dept: Department) {
    this.editingDept = { ...dept };
    this.showNewDeptForm = false;
  }

  submitEditDept() {
    if (this.editingDept) {
      this.api.updateDepartment(this.editingDept.id, this.editingDept).subscribe({
        next: () => {
          this.loadDepartments();
          this.editingDept = null;
        }
      });
    }
  }

  cancelForm() {
    this.showNewDeptForm = false;
    this.editingDept = null;
  }

  deleteDept(id: number) {
    if (confirm('Delete this unit?')) {
      this.api.deleteDepartment(id).subscribe({
        next: () => this.loadDepartments()
      });
    }
  }

  getDeptStyles(deptName: string) {
    const d = deptName.toLowerCase();
    if (d.includes('it')) {
      return { background: '#eff6ff', color: '#1d4ed8', 'border-color': '#d0e6ff' };
    } else if (d.includes('human resources') || d.includes('hr')) {
      return { background: '#fefce8', color: '#a16207', 'border-color': '#fef08a' };
    } else if (d.includes('finance')) {
      return { background: '#dcfce7', color: '#166534', 'border-color': '#bbf7d0' };
    } else if (d.includes('marketing')) {
      return { background: '#f5f3ff', color: '#7c3aed', 'border-color': '#ddd6fe' };
    }
    return { background: '#f8fafc', color: '#64748b', 'border-color': '#e2e8f0' };
  }

  seedSampleDepartments() {
    const samples = [
      { name: 'Engineering', description: 'Core software architecture and infrastructure development.' },
      { name: 'Human Capital', description: 'Strategic talent acquisition and employee lifecycle management.' },
      { name: 'Marketing & Sales', description: 'Brand positioning, market expansion, and revenue growth.' },
      { name: 'Corporate Finance', description: 'Asset management, auditing, and strategic financial planning.' }
    ];
    
    samples.forEach(sample => {
      this.api.addDepartment(sample).subscribe({
        next: () => this.loadDepartments()
      });
    });
  }
}
