import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Leave, LeaveType, LeaveBalance, Employee } from '../../services/api.service';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>📅 Absence Management</h1>
        <div class="header-actions">
          <button (click)="toggleNewLeaveForm()" class="btn btn-primary">+ Request Absence</button>
        </div>
      </div>

      @if (showNewLeaveForm) {
        <div class="card form-card" style="margin-bottom: 2rem; border-left: 4px solid #3b82f6;">
          <h2 style="margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 800; color: #1e293b;">Submit New Absence Request</h2>
          <form (ngSubmit)="submitNewLeave()" class="form-grid">
            <div class="form-group">
              <label class="label">Workforce Resource</label>
              <select class="select" [(ngModel)]="newLeave.employee_id" name="employee_id" required style="background: #f8fafc; border-color: #e2e8f0;">
                <option [value]="0">Select Personnel</option>
                @for (emp of employees; track emp.id) {
                  <option [value]="emp.id">{{ emp.full_name }} ({{ emp.employee_id }})</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label class="label">Absence Classification</label>
              <select class="select" [(ngModel)]="newLeave.leave_type_id" name="leave_type_id" required (change)="onLeaveTypeChange()" style="background: #f8fafc; border-color: #e2e8f0;">
                <option [value]="0">Select Type</option>
                @for (type of leaveTypes; track type.id) {
                  <option [value]="type.id">{{ type.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label class="label">Commencement Date</label>
              <input type="date" class="input" [(ngModel)]="newLeave.start_date" name="start_date" required style="background: #f8fafc; border-color: #e2e8f0;" />
            </div>
            <div class="form-group">
              <label class="label">Conclusion Date</label>
              <input type="date" class="input" [(ngModel)]="newLeave.end_date" name="end_date" required style="background: #f8fafc; border-color: #e2e8f0;" />
            </div>
            <div class="form-group full-width">
              <label class="label">Justification / Reason</label>
              <textarea class="input" [(ngModel)]="newLeave.reason" name="reason" rows="3" style="background: #f8fafc; border-color: #e2e8f0;"></textarea>
            </div>
            <div class="form-actions full-width" style="margin-top: 1rem;">
              <button type="submit" class="btn btn-success" [disabled]="!newLeave.employee_id || !newLeave.leave_type_id" style="padding: 0.75rem 1.5rem;">Submit Request</button>
              <button type="button" (click)="toggleNewLeaveForm()" class="btn btn-secondary">Discard</button>
            </div>
          </form>
        </div>
      }

      <div class="card" style="margin-bottom: 2rem;">
        <h2 style="margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 800; color: #1e293b;">📋 Absence Requests Registry</h2>
        @if (loading) {
          <div class="loading-spinner"></div>
        } @else if (leaves.length === 0) {
          <div class="empty-state">No pending or historical absence requests found.</div>
        } @else {
          <div class="table-wrap" style="border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <table class="table">
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="color: #475569; font-weight: 800;">Resource Name</th>
                  <th style="color: #475569; font-weight: 800;">Classification</th>
                  <th style="color: #475569; font-weight: 800;">Duration</th>
                  <th style="color: #475569; font-weight: 800;">Reason</th>
                  <th style="color: #475569; font-weight: 800;">Status</th>
                  <th style="color: #475569; font-weight: 800;">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (leave of leaves; track leave.id) {
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td>
                      <div style="font-weight: 700; color: #1e293b;">{{ getEmployeeName(leave.employee_id) }}</div>
                    </td>
                    <td>
                      <span style="background: #eff6ff; color: #1d4ed8; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700;">
                        {{ getLeaveTypeName(leave.leave_type_id) }}
                      </span>
                    </td>
                    <td style="color: #475569; font-weight: 600; font-size: 0.85rem;">
                      {{ leave.start_date }} <br/> to {{ leave.end_date }}
                    </td>
                    <td style="color: #64748b; font-size: 0.85rem; max-width: 200px;">{{ leave.reason || '-' }}</td>
                    <td>
                      <span class="badge" 
                            [style.background]="leave.status.toLowerCase() === 'approved' ? '#dcfce7' : (leave.status.toLowerCase() === 'pending' ? '#fef3c7' : '#fee2e2')"
                            [style.color]="leave.status.toLowerCase() === 'approved' ? '#166534' : (leave.status.toLowerCase() === 'pending' ? '#92400e' : '#991b1b')"
                            style="border-radius: 8px; padding: 0.35rem 0.75rem; font-weight: 800; font-size: 0.7rem; text-transform: uppercase;">
                        {{ leave.status }}
                      </span>
                    </td>
                    <td>
                      @if (leave.status.toLowerCase() === 'pending') {
                        <div class="action-buttons" style="display: flex; gap: 0.5rem;">
                          <button (click)="updateLeave(leave.id, 'Approved')" class="btn btn-sm" style="background: #10b981; color: white;">Approve</button>
                          <button (click)="updateLeave(leave.id, 'Rejected')" class="btn btn-sm" style="background: #ef4444; color: white;">Reject</button>
                        </div>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <div class="card">
        <div class="balance-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem;">
          <h2 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #1e293b;">📊 Entitlement Balances</h2>
          <div class="employee-selector" style="display: flex; align-items: center; gap: 0.75rem;">
            <label style="font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase;">Select Personnel: </label>
            <select [(ngModel)]="selectedEmployeeId" (change)="loadLeaveBalances()" class="select" style="width: auto; min-width: 200px; padding: 0.4rem 0.8rem; background: #f8fafc;">
              <option [value]="0">-- Select --</option>
              @for (emp of employees; track emp.id) {
                <option [value]="emp.id">{{ emp.full_name }}</option>
              }
            </select>
          </div>
        </div>
        
        @if (selectedEmployeeId === 0) {
          <div class="empty-state">Select a personnel resource to view their current leave entitlements.</div>
        } @else if (leaveBalances.length === 0) {
          <div class="empty-state">No entitlement data found for this resource.</div>
        } @else {
          <div class="balance-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
            @for (balance of leaveBalances; track balance.id) {
              <div class="balance-card" style="background: #ffffff; padding: 1.5rem; border-radius: 16px; border: 1px solid #e0eefc; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: transform 0.2s;">
                <div class="balance-name" style="color: #1e293b; font-weight: 800; font-size: 1.1rem; margin-bottom: 1.25rem; border-bottom: 2px solid #eff6ff; padding-bottom: 0.5rem;">
                  {{ getLeaveTypeName(balance.leave_type_id) }}
                </div>
                <div class="balance-stats" style="display: flex; justify-content: space-between;">
                  <div class="stat">
                    <span class="stat-value" style="font-size: 1.5rem; font-weight: 800; color: #64748b;">{{ balance.total_days }}</span>
                    <span class="stat-label" style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Total</span>
                  </div>
                  <div class="stat">
                    <span class="stat-value" style="font-size: 1.5rem; font-weight: 800; color: #f59e0b;">{{ balance.used_days }}</span>
                    <span class="stat-label" style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Consumed</span>
                  </div>
                  <div class="stat">
                    <span class="stat-value" style="font-size: 1.5rem; font-weight: 900; color: #10b981;">{{ balance.available_days }}</span>
                    <span class="stat-label" style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Available</span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      width: 100%;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .page-header h1 {
      margin: 0;
      color: var(--text);
      font-size: clamp(1.35rem, 1.2rem + 0.8vw, 1.95rem);
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .card {
      background: var(--bg-card);
      padding: 1.75rem;
      border-radius: 16px;
      box-shadow: var(--shadow);
      border: 1px solid #e0eefc;
      backdrop-filter: blur(12px);
    }

    .balance-card:hover {
      transform: translateY(-4px);
      border-color: #3b82f6;
      box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.1);
    }

    .loading-spinner {
      width: 34px;
      height: 34px;
      margin: 2rem auto;
      border-radius: 50%;
      border: 3px solid #f1f5f9;
      border-top-color: #3b82f6;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #64748b;
      font-style: italic;
    }

    @media (max-width: 820px) {
      .balance-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LeavesComponent implements OnInit {
  leaves: Leave[] = [];
  leaveTypes: LeaveType[] = [];
  leaveBalances: LeaveBalance[] = [];
  employees: Employee[] = [];
  loading = false;
  showNewLeaveForm = false;

  newLeave = {
    employee_id: 0,
    leave_type_id: 0,
    start_date: '',
    end_date: '',
    reason: ''
  };

  selectedEmployeeId = 0;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loading = true;
    this.api.getLeaveTypes().subscribe(types => {
      this.leaveTypes = types;
      this.api.getEmployees().subscribe(emps => {
        this.employees = emps;
        this.loadLeaves();
      });
    });
  }

  loadLeaves() {
    this.loading = true;
    this.api.getLeaves().subscribe({
      next: (data) => {
        this.leaves = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading leaves:', err);
        this.loading = false;
      }
    });
  }

  loadLeaveBalances() {
    if (this.selectedEmployeeId) {
      this.api.getLeaveBalance(this.selectedEmployeeId).subscribe({
        next: (data) => {
          this.leaveBalances = data;
        },
        error: (err) => console.error('Error loading balances:', err)
      });
    } else {
      this.leaveBalances = [];
    }
  }

  onLeaveTypeChange() { }

  toggleNewLeaveForm() {
    this.showNewLeaveForm = !this.showNewLeaveForm;
    if (this.showNewLeaveForm) {
      this.newLeave = { employee_id: 0, leave_type_id: 0, start_date: '', end_date: '', reason: '' };
    }
  }

  submitNewLeave() {
    if (!this.newLeave.employee_id || !this.newLeave.leave_type_id) return;
    
    this.api.requestLeave(this.newLeave).subscribe({
      next: () => {
        this.loadLeaves();
        this.showNewLeaveForm = false;
        this.newLeave = { employee_id: 0, leave_type_id: 0, start_date: '', end_date: '', reason: '' };
      },
      error: (err) => console.error('Error requesting leave:', err)
    });
  }

  updateLeave(leaveId: number, status: string) {
    this.api.updateLeave(leaveId, { status }).subscribe({
      next: () => this.loadLeaves(),
      error: (err) => console.error('Error updating leave:', err)
    });
  }

  getLeaveTypeName(typeId: any): string {
    if (!typeId) return 'N/A';
    const id = Number(typeId);
    const type = this.leaveTypes.find(t => t.id === id);
    if (type) return type.name;
    if (isNaN(id) && typeof typeId === 'string') return typeId;
    return `Type: ${typeId}`;
  }

  getEmployeeName(employeeId: any): string {
    if (!employeeId) return 'Unknown';
    const id = Number(employeeId);
    const emp = this.employees.find(e => e.id === id);
    if (emp) return emp.full_name;
    if (isNaN(id) && typeof employeeId === 'string') return employeeId;
    return `ID: ${employeeId}`;
  }
}
