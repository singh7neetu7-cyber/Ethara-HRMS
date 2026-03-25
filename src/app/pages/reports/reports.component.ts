import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, AttendanceRecord, AttendanceReport, DailyStatistics, DepartmentStatistics, Employee } from '../../services/api.service';
import { Chart as ChartJS, BarController, LineController, PieController, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarController, LineController, PieController, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>📊 Performance Insights</h1>
      </div>

      <div class="selectors-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        <!-- Date Selector Card -->
        <div class="card selector-card" style="padding: 1.5rem; background: #ffffff;">
          <label class="label">Daily Audit View</label>
          <div class="selector-controls" style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
            <input type="date" class="input" [(ngModel)]="selectedDate" (change)="loadDailyStatistics()" style="background: #f8fafc; border-color: #e2e8f0;">
          </div>
        </div>

        <!-- Month/Year Selector Card -->
        <div class="card selector-card" style="padding: 1.5rem; background: #ffffff;">
          <label class="label">Periodic Audit View</label>
          <div class="selector-controls" style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
            <select class="select" [(ngModel)]="currentMonth" (change)="loadMonthlyReport()" style="background: #f8fafc; border-color: #e2e8f0;">
              @for (m of months; track m.value) {
                <option [value]="m.value">{{ m.label }}</option>
              }
            </select>
            <select class="select" [(ngModel)]="currentYear" (change)="loadMonthlyReport()" style="background: #f8fafc; border-color: #e2e8f0;">
              @for (y of years; track y) {
                <option [value]="y">{{ y }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Employee Selector Card -->
        <div class="card selector-card" style="padding: 1.5rem; background: #ffffff;">
          <label class="label">Individual Resource Audit</label>
          <div class="selector-controls" style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
            <select class="select" [(ngModel)]="selectedEmployeeId" (change)="loadEmployeeReport()" style="background: #f8fafc; border-color: #e2e8f0;">
              <option [ngValue]="null">All Personnel</option>
              @for (e of employees; track e.id) {
                <option [value]="e.id">{{ e.full_name }} ({{ e.employee_id }})</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Daily Statistics -->
      <div class="card stats-card" *ngIf="!selectedEmployeeId" style="background: #ffffff;">
        <h2 style="margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 800; color: #1e293b; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem;">Daily Attendance Summary - {{ selectedDate }}</h2>
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem;">
          <div class="stat-box" style="background: #f8fafc; border-left: 4px solid #64748b; padding: 1.5rem; border-radius: 12px; text-align: center;">
            <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #1e293b;">{{ dailyStats?.total_employees || 0 }}</div>
            <div class="stat-label" style="font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase;">Total Personnel</div>
          </div>
          <div class="stat-box success" style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 1.5rem; border-radius: 12px; text-align: center;">
            <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #065f46;">{{ dailyStats?.present_today || 0 }}</div>
            <div class="stat-label" style="font-size: 0.75rem; font-weight: 800; color: #10b981; text-transform: uppercase;">Present</div>
            <div class="stat-percent" style="font-size: 0.8rem; font-weight: 800; color: #059669;">{{ dailyStats?.present_percentage || 0 }}%</div>
          </div>
          <div class="stat-box danger" style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; border-radius: 12px; text-align: center;">
            <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #991b1b;">{{ dailyStats?.absent_today || 0 }}</div>
            <div class="stat-label" style="font-size: 0.75rem; font-weight: 800; color: #ef4444; text-transform: uppercase;">Absent</div>
            <div class="stat-percent" style="font-size: 0.8rem; font-weight: 800; color: #dc2626;">{{ dailyStats?.absent_percentage || 0 }}%</div>
          </div>
          <div class="stat-box warning" style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 1.5rem; border-radius: 12px; text-align: center;">
            <div class="stat-value" style="font-size: 2rem; font-weight: 800; color: #92400e;">{{ dailyStats?.leave_today || 0 }}</div>
            <div class="stat-label" style="font-size: 0.75rem; font-weight: 800; color: #d97706; text-transform: uppercase;">Absence / Leave</div>
          </div>
        </div>
      </div>

      <!-- Employee Specific Stats -->
      <div class="card stats-card" *ngIf="selectedEmployeeId && employeeReport" style="background: #ffffff; border-left: 4px solid #3b82f6;">
        <h2 style="margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 800; color: #1e293b;">Resource Performance Audit - {{ employeeReport.full_name }}</h2>
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
          <div class="stat-box" style="background: #f8fafc; border-radius: 12px; padding: 1.5rem; text-align: center;">
            <div class="stat-value" style="font-size: 2.2rem; font-weight: 800; color: #1e293b;">{{ employeeReport.total_days }}</div>
            <div class="stat-label" style="font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase;">Working Days</div>
          </div>
          <div class="stat-box success" style="background: #f0fdf4; border-radius: 12px; padding: 1.5rem; text-align: center;">
            <div class="stat-value" style="font-size: 2.2rem; font-weight: 800; color: #059669;">{{ employeeReport.total_present }}</div>
            <div class="stat-label" style="font-size: 0.75rem; font-weight: 800; color: #10b981; text-transform: uppercase;">Days Present</div>
          </div>
          <div class="stat-box danger" style="background: #fef2f2; border-radius: 12px; padding: 1.5rem; text-align: center;">
            <div class="stat-value" style="font-size: 2.2rem; font-weight: 800; color: #dc2626;">{{ employeeReport.total_absent }}</div>
            <div class="stat-label" style="font-size: 0.75rem; font-weight: 800; color: #ef4444; text-transform: uppercase;">Days Absent</div>
          </div>
          <div class="stat-box warning" style="background: #eff6ff; border-radius: 12px; padding: 1.5rem; text-align: center;">
            <div class="stat-value" style="font-size: 2.2rem; font-weight: 900; color: #1d4ed8;">{{ employeeReport.percentage }}%</div>
            <div class="stat-label" style="font-size: 0.75rem; font-weight: 800; color: #3b82f6; text-transform: uppercase;">Audit Score</div>
          </div>
        </div>
      </div>

      <!-- Department Statistics -->
      <div class="card" *ngIf="!selectedEmployeeId" style="background: #ffffff;">
        <h2 style="margin-bottom: 2rem; font-size: 1.25rem; font-weight: 800; color: #1e293b;">Unit Performance Audit - {{ selectedDate }}</h2>
        @if (deptStats.length === 0) {
          <div class="empty-state">No department-level audit data available for this date.</div>
        } @else {
          <div class="dept-stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
            @for (dept of deptStats; track dept.department_id) {
              <div class="dept-stat-card" style="background: #f8fafc; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; transition: transform 0.2s;">
                <h3 style="margin: 0 0 1.25rem 0; color: #1e293b; font-size: 1.1rem; font-weight: 800;">{{ dept.department_name }}</h3>
                <div class="dept-numbers" style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem;">
                  <div class="number" style="flex: 1; text-align: center; padding: 0.75rem; background: #ffffff; border-radius: 10px; border: 1px solid #f1f5f9;">
                    <span class="value" style="display: block; font-size: 1.25rem; font-weight: 800; color: #475569;">{{ dept.total_employees }}</span>
                    <span class="label" style="font-size: 0.65rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Resources</span>
                  </div>
                  <div class="number success" style="flex: 1; text-align: center; padding: 0.75rem; background: #f0fdf4; border-radius: 10px; border: 1px solid #dcfce7;">
                    <span class="value" style="display: block; font-size: 1.25rem; font-weight: 800; color: #10b981;">{{ dept.present_count }}</span>
                    <span class="label" style="font-size: 0.65rem; color: #059669; font-weight: 700; text-transform: uppercase;">Present</span>
                  </div>
                  <div class="number danger" style="flex: 1; text-align: center; padding: 0.75rem; background: #fef2f2; border-radius: 10px; border: 1px solid #fee2e2;">
                    <span class="value" style="display: block; font-size: 1.25rem; font-weight: 800; color: #ef4444;">{{ dept.absent_count }}</span>
                    <span class="label" style="font-size: 0.65rem; color: #dc2626; font-weight: 700; text-transform: uppercase;">Absent</span>
                  </div>
                </div>
                <div class="dept-progress" style="display: flex; align-items: center; gap: 0.75rem;">
                  <div class="progress-bar" style="flex: 1; height: 10px; background: #f1f5f9; border-radius: 99px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);">
                    <div class="progress success" [style.width.%]="dept.present_percentage" style="height: 100%; background: #10b981; border-radius: 99px;"></div>
                  </div>
                  <span class="percent-text" style="font-size: 0.85rem; font-weight: 800; color: #1e293b;">{{ dept.present_percentage }}% Score</span>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Charts View -->
      <div class="charts-grid" *ngIf="!selectedEmployeeId" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 1.5rem;">
        <div class="card chart-card" style="background: #ffffff; padding: 1.75rem; border-radius: 16px;">
          <h2 style="margin-bottom: 1.5rem; font-size: 1.15rem; font-weight: 800; color: #1e293b;">Daily Attendance Audit (Pie)</h2>
          <div style="height: 320px;"><canvas #dailyChart></canvas></div>
        </div>
        <div class="card chart-card" style="background: #ffffff; padding: 1.75rem; border-radius: 16px;">
          <h2 style="margin-bottom: 1.5rem; font-size: 1.15rem; font-weight: 800; color: #1e293b;">Monthly Performance Audit (Bar)</h2>
          <div style="height: 320px;"><canvas #monthlyChart></canvas></div>
        </div>
      </div>

      <!-- Individual Resource Chart -->
      <div class="card chart-card" *ngIf="selectedEmployeeId && employeeReport" style="background: #ffffff; padding: 1.75rem; border-radius: 16px;">
        <h2 style="margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 800; color: #1e293b;">Attendance Trend Analysis - {{ employeeReport.full_name }}</h2>
        <div style="height: 380px;"><canvas #employeeChart></canvas></div>
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
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0;
      color: var(--text);
      font-size: 1.8rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .card {
      background: var(--bg-card);
      padding: 1.75rem;
      border-radius: 16px;
      box-shadow: var(--shadow);
      border: 1px solid #e0eefc;
      backdrop-filter: blur(12px);
      margin-bottom: 1.5rem;
    }

    .label {
      font-size: 0.72rem;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .dept-stat-card:hover {
      transform: translateY(-4px);
      border-color: #3b82f6 !important;
      box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.1);
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #64748b;
      font-style: italic;
    }

    @media (max-width: 1024px) {
      .charts-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ReportsComponent implements OnInit, AfterViewInit {
  @ViewChild('dailyChart') dailyChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthlyChart') monthlyChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('employeeChart') employeeChartCanvas!: ElementRef<HTMLCanvasElement>;

  selectedDate = new Date().toISOString().split('T')[0];
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();
  selectedEmployeeId: number | null = null;

  loadingDaily = false;
  dailyStats: DailyStatistics | null = null;
  dailyAttendanceRecords: AttendanceRecord[] = [];
  monthlyReports: AttendanceReport[] = [];
  deptStats: DepartmentStatistics[] = [];
  employees: Employee[] = [];
  employeeReport: AttendanceReport | null = null;

  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  years = [2024, 2025, 2026];

  dailyChart: ChartJS | null = null;
  monthlyChart: ChartJS | null = null;
  employeeChart: ChartJS | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadEmployees();
    this.loadMonthlyReport();
    this.loadDepartmentStatistics();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateCharts();
    }, 400);
  }

  loadEmployees() {
    this.api.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loadDailyStatistics();
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  loadDailyStatistics() {
    this.loadingDaily = true;
    this.api.getDailyStatistics(this.selectedDate).subscribe({
      next: (data) => {
        this.dailyStats = data;
        this.createDailyChart();
      },
      error: (err) => console.error('Error loading daily statistics:', err)
    });

    this.api.getAttendance({ date: this.selectedDate }).subscribe({
      next: (data) => {
        this.dailyAttendanceRecords = data;
        this.loadingDaily = false;
      }
    });
  }

  loadMonthlyReport() {
    this.api.getMonthlyAttendanceReport(this.currentMonth, this.currentYear).subscribe({
      next: (data) => {
        this.monthlyReports = data;
        this.createMonthlyChart();
        if (this.selectedEmployeeId) this.loadEmployeeReport();
      }
    });
  }

  loadDepartmentStatistics() {
    this.api.getDepartmentStatistics(this.selectedDate).subscribe({
      next: (data) => this.deptStats = data
    });
  }

  loadEmployeeReport() {
    if (!this.selectedEmployeeId) {
      this.employeeReport = null;
      setTimeout(() => this.updateCharts(), 0);
      return;
    }

    const report = this.monthlyReports.find(r => r.employee_id == this.selectedEmployeeId);
    if (report) {
      this.employeeReport = report;
    } else {
      this.employeeReport = {
        employee_id: Number(this.selectedEmployeeId),
        full_name: this.employees.find(e => e.id == this.selectedEmployeeId)?.full_name || 'Personnel',
        total_present: 0,
        total_absent: 0,
        total_days: 0,
        percentage: 0
      };
    }
    setTimeout(() => this.createEmployeeChart(), 100);
  }

  getMonthName(m: number): string {
    return this.months.find(month => month.value == m)?.label || '';
  }

  private updateCharts() {
    if (!this.selectedEmployeeId) {
      this.createDailyChart();
      this.createMonthlyChart();
    } else {
      this.createEmployeeChart();
    }
  }

  private createDailyChart() {
    if (!this.dailyChartCanvas || !this.dailyStats || this.selectedEmployeeId) return;
    const ctx = this.dailyChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.dailyChart) this.dailyChart.destroy();
    this.dailyChart = new ChartJS(ctx, {
      type: 'pie',
      data: {
        labels: ['Present', 'Absent', 'Leave'],
        datasets: [{
          data: [this.dailyStats.present_today, this.dailyStats.absent_today, this.dailyStats.leave_today],
          backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#475569', font: { weight: 600 } } }
        }
      }
    });
  }

  private createMonthlyChart() {
    if (!this.monthlyChartCanvas || this.monthlyReports.length === 0 || this.selectedEmployeeId) return;
    const ctx = this.monthlyChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.monthlyChart) this.monthlyChart.destroy();
    this.monthlyChart = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: this.monthlyReports.slice(0, 10).map(r => r.full_name),
        datasets: [
          { label: 'Present', data: this.monthlyReports.slice(0, 10).map(r => r.total_present), backgroundColor: '#10b981', borderRadius: 4 },
          { label: 'Absent', data: this.monthlyReports.slice(0, 10).map(r => r.total_absent), backgroundColor: '#ef4444', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#475569', font: { weight: 600 } } } },
        scales: {
          y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  private createEmployeeChart() {
    if (!this.employeeChartCanvas || !this.employeeReport) return;
    const ctx = this.employeeChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.employeeChart) this.employeeChart.destroy();
    this.employeeChart = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Present', 'Absent'],
        datasets: [{
          data: [this.employeeReport.total_present, this.employeeReport.total_absent],
          backgroundColor: ['#10b981', '#ef4444'],
          borderWidth: 0,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#475569', font: { size: 14, weight: 600 } } } },
        cutout: '70%'
      }
    });
  }
}
