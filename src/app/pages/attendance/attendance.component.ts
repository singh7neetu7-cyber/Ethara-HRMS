import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService, Employee, AttendanceRecord, AttendanceCreate } from '../../services/api.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title">Time & Attendance</h1>

    <div class="card" style="margin-bottom: 2rem;">
      <h2 style="margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 800; color: #1e293b;">📅 Mark Daily Attendance</h2>
      @if (markSuccess) {
        <div class="alert alert-success">{{ markSuccess }}</div>
      }
      @if (markError) {
        <div class="alert alert-error">{{ markError }}</div>
      }
      <form (ngSubmit)="onMarkAttendance()" style="max-width: 500px;">
        <div class="form-group">
          <label class="label">Workforce Resource</label>
          <select class="select" [(ngModel)]="markForm.employee" name="employee" required style="background: #f8fafc; border-color: #e2e8f0;">
            <option [ngValue]="null" disabled>Select resource</option>
            @for (e of employees; track e.id) {
              <option [ngValue]="e.id">{{ e.employee_id }} – {{ e.full_name }}</option>
            }
          </select>
        </div>
        <div class="form-group">
          <label class="label">Reference Date</label>
          <input type="date" class="input" [(ngModel)]="markForm.date" name="date" required (change)="onDateChange()" style="background: #f8fafc; border-color: #e2e8f0;" />
          @if (isSundaySelected) {
            <small style="color: #dc2626; display: block; margin-top: 6px; font-weight: 600;">ℹ️ Selected date is a Sunday (Public Holiday)</small>
          }
        </div>
        <div class="form-group">
          <label class="label">Presence Status</label>
          <select class="select" [(ngModel)]="markForm.status" name="status" required style="background: #f8fafc; border-color: #e2e8f0;">
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" style="margin-top: 0.5rem; padding: 0.75rem 1.5rem;">Confirm Record</button>
      </form>
    </div>

    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <h2 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #1e293b;">📋 Historical Records</h2>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="label" style="font-size: 0.65rem;">Filter Personnel</label>
            <select class="select" style="width: auto; min-width: 220px; font-size: 0.85rem; background: #f8fafc;" [(ngModel)]="filterEmployeeId" (ngModelChange)="loadAttendance()">
              <option [ngValue]="null">Full Workforce</option>
              @for (e of employees; track e.id) {
                <option [ngValue]="e.id">{{ e.employee_id }} – {{ e.full_name }}</option>
              }
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="label" style="font-size: 0.65rem;">Filter Date</label>
            <input type="date" class="input" style="width: auto; font-size: 0.85rem; background: #f8fafc;" [(ngModel)]="filterDate" (ngModelChange)="loadAttendance()" />
          </div>
        </div>
      </div>

      @if (loadingAttendance) {
        <div class="loading-spinner"></div>
      } @else if (attendanceError) {
        <div class="error-state" style="color: #dc2626;">{{ attendanceError }}</div>
      } @else if (attendance.length === 0) {
        <div class="empty-state">No attendance logs found for the selected criteria.</div>
      } @else {
        <div class="table-wrap" style="border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <table class="table">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="color: #475569; font-weight: 800;">Resource Name</th>
                <th style="color: #475569; font-weight: 800;">Record Date</th>
                <th style="color: #475569; font-weight: 800;">Status</th>
              </tr>
            </thead>
            <tbody>
              @for (a of attendance; track a.id) {
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td>
                    <div style="font-weight: 700; color: #1e293b;">{{ a.full_name || a.emp_code }}</div>
                    <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 600;">ID: {{ a.emp_code || a.employee_id }}</div>
                  </td>
                  <td style="color: #475569; font-weight: 600;">{{ a.date }}</td>
                  <td>
                    <span class="badge" 
                          [style.background]="a.status === 'Present' ? '#dcfce7' : '#fee2e2'"
                          [style.color]="a.status === 'Present' ? '#166534' : '#991b1b'"
                          style="border-radius: 8px; padding: 0.35rem 0.75rem; font-weight: 800; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;">
                      {{ a.status }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class AttendanceComponent implements OnInit {
  employees: Employee[] = [];
  attendance: AttendanceRecord[] = [];
  loadingAttendance = false;
  attendanceError: string | null = null;
  markSuccess: string | null = null;
  markError: string | null = null;
  filterEmployeeId: number | null = null;
  filterDate: string | null = null;
  isSundaySelected = false;
  markForm: AttendanceCreate = {
    employee: 0 as unknown as number,
    employee_id: 0 as unknown as number,
    date: new Date().toISOString().slice(0, 10),
    status: 'Present',
  };

  constructor(private api: ApiService) {
    this.onDateChange();
  }

  ngOnInit(): void {
    this.api.getEmployees().subscribe({
      next: (list) => {
        this.employees = list;
        if (list.length && !this.markForm.employee) {
          this.markForm.employee = list[0].id;
        }
      },
    });
    this.loadAttendance();
  }

  onDateChange(): void {
    if (this.markForm.date) {
      const selected = new Date(this.markForm.date);
      this.isSundaySelected = selected.getDay() === 0;
    }
  }

  loadAttendance(): void {
    this.loadingAttendance = true;
    this.attendanceError = null;
    const params: { employeeId?: number; date?: string } = {};
    if (this.filterEmployeeId != null) params.employeeId = this.filterEmployeeId;
    if (this.filterDate) params.date = this.filterDate;
    this.api.getAttendance(params).subscribe({
      next: (list) => {
        this.attendance = list;
        this.loadingAttendance = false;
      },
      error: (err: string) => {
        this.attendanceError = err;
        this.loadingAttendance = false;
      },
    });
  }

  onMarkAttendance(): void {
    this.markError = null;
    this.markSuccess = null;
    const payload: AttendanceCreate = {
      employee: Number(this.markForm.employee),
      employee_id: Number(this.markForm.employee),
      date: String(this.markForm.date),
      status: this.markForm.status,
    };
    if (!payload.employee || !payload.date) {
      this.markError = 'Resource selection and date are required.';
      return;
    }
    this.api.markAttendance(payload).subscribe({
      next: () => {
        this.markSuccess = 'Attendance record confirmed successfully.';
        this.loadAttendance();
      },
      error: (err: string) => {
        this.markError = err;
      },
    });
  }
}
