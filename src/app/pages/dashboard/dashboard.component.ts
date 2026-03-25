import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ApiService, SummaryRow } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import {
  Chart as ChartJS,
  DoughnutController,
  BarController,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  DoughnutController,
  BarController,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, AfterViewInit {
  loading = true;
  error: string | null = null;
  summaryRows: SummaryRow[] = [];
  summary: { totalEmployees: number; totalPresentDays: number; totalAbsentDays: number; totalRecords: number } | null = null;
  
  doughnutChart: ChartJS | null = null;
  barChart: ChartJS | null = null;
  
  dataLoaded = false;
  viewInitialized = false;
  selectedDate: string = '';

  @ViewChild('doughnutChartCanvas', { static: false }) doughnutChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartCanvas', { static: false }) barChartCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {
    this.selectedDate = this.getTodayDate();
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    forkJoin([
      this.api.getAttendanceSummary(), 
      this.api.getDashboardSummary()
    ]).subscribe({
      next: ([rows, totals]) => {
        this.summaryRows = rows;
        this.summary = {
          totalEmployees: rows.length,
          totalPresentDays: totals.total_present ?? 0,
          totalAbsentDays: totals.total_absent ?? 0,
          totalRecords: totals.total_records ?? 0,
        };
        this.dataLoaded = true;
        this.loading = false;
        this.cdr.detectChanges();
        
        if (this.viewInitialized) {
          this.initCharts();
        }
      },
      error: (err: string) => {
        this.error = err;
        this.loading = false;
      },
    });
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    if (this.dataLoaded) {
      this.initCharts();
    }
  }

  private initCharts(): void {
    setTimeout(() => {
      this.createDoughnutChart();
      this.createBarChart();
    }, 0);
  }

  private createDoughnutChart(): void {
    try {
      if (!this.doughnutChartCanvas) return;
      const ctx = this.doughnutChartCanvas.nativeElement.getContext('2d');
      if (!ctx) return;

      if (this.doughnutChart) this.doughnutChart.destroy();

      const totalPresent = this.summaryRows.reduce((s, r) => s + (r.present_days ?? 0), 0);
      const totalAbsent = this.summaryRows.reduce((s, r) => s + ((r.total_records ?? 0) - (r.present_days ?? 0)), 0);

      this.doughnutChart = new ChartJS(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Present Days', 'Absent Days'],
          datasets: [{
            data: [totalPresent, totalAbsent],
            backgroundColor: ['#10b981', '#ef4444'],
            borderColor: ['#ffffff', '#ffffff'],
            borderWidth: 4,
            hoverOffset: 12
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: 'bottom', 
              labels: { 
                color: '#475569',
                padding: 20,
                font: { size: 12, weight: 600 }
              } 
            },
            tooltip: {
              backgroundColor: '#1e293b',
              titleFont: { size: 14, weight: 'bold' },
              padding: 12,
              callbacks: {
                label: (context: any) => {
                  const val = context.parsed;
                  const total = totalPresent + totalAbsent;
                  const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                  return ` ${val} days (${pct}%)`;
                }
              }
            }
          },
          cutout: '70%'
        }
      });
    } catch (e) { console.error(e); }
  }

  private createBarChart(): void {
    try {
      if (!this.barChartCanvas) return;
      const ctx = this.barChartCanvas.nativeElement.getContext('2d');
      if (!ctx) return;

      if (this.barChart) this.barChart.destroy();

      this.barChart = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: this.summaryRows.map(row => row.full_name),
          datasets: [
            {
              label: 'Present',
              data: this.summaryRows.map(row => row.present_days),
              backgroundColor: '#10b981',
              borderRadius: 6,
              barThickness: 24
            },
            {
              label: 'Absent',
              data: this.summaryRows.map(row => (row.total_records ?? 0) - (row.present_days ?? 0)),
              backgroundColor: '#ef4444',
              borderRadius: 6,
              barThickness: 24
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { 
              beginAtZero: true, 
              ticks: { color: '#64748b', font: { weight: 600 } }, 
              grid: { color: '#f1f5f9' } 
            },
            x: { 
              ticks: { color: '#64748b', font: { weight: 600 } }, 
              grid: { display: false } 
            }
          },
          plugins: {
            legend: { 
              labels: { 
                color: '#475569',
                font: { weight: 600 }
              } 
            }
          }
        }
      });
    } catch (e) { console.error(e); }
  }

  refreshData(): void {
    this.loadData();
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  onDateChange(dateString: string): void {
    this.selectedDate = dateString;
    this.loadData();
  }

  getTopPerformer(): string {
    if (!this.summaryRows.length) return 'N/A';
    const top = [...this.summaryRows].sort((a, b) => (b.present_days / (b.total_records || 1)) - (a.present_days / (a.total_records || 1)))[0];
    return top.full_name;
  }

  getAttendanceRate(): string {
    if (!this.summary) return '0%';
    const total = this.summary.totalRecords;
    if (!total) return '0%';
    return ((this.summary.totalPresentDays / total) * 100).toFixed(1) + '%';
  }

  getDeptStyles(department: string): { [key: string]: string } {
    const d = (department || '').toLowerCase();
    const base = {
      padding: '0.2rem 0.6rem',
      'border-radius': '6px',
      'font-size': '0.75rem',
      'font-weight': '700'
    };

    if (d.includes('it')) {
      return { ...base, background: '#eff6ff', color: '#1d4ed8' };
    } else if (d.includes('human resources') || d.includes('hr')) {
      return { ...base, background: '#fefce8', color: '#a16207' };
    } else if (d.includes('finance')) {
      return { ...base, background: '#dcfce7', color: '#166534' };
    } else if (d.includes('marketing')) {
      return { ...base, background: '#f5f3ff', color: '#7c3aed' };
    }
    return { ...base, background: '#f8fafc', color: '#64748b' };
  }
}
