import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Holiday } from '../../services/api.service';

@Component({
  selector: 'app-holidays',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 style="color: #0369a1;">🎉 Public Holidays</h1>
        <div class="header-actions">
          <button (click)="seedIndianHolidays()" class="btn btn-secondary" *ngIf="holidays.length === 0">Import Registry</button>
          <button (click)="toggleNewHolidayForm()" class="btn btn-primary">+ Add Holiday</button>
        </div>
      </div>

      <div class="grid-layout">
        <!-- Calendar View -->
        <div class="card calendar-card">
          <div class="calendar-header">
            <button (click)="prevMonth()" class="nav-btn">&lt;</button>
            <h2 style="color: #0369a1;">{{ getMonthName(viewDate) }} {{ viewDate.getFullYear() }}</h2>
            <button (click)="nextMonth()" class="nav-btn">&gt;</button>
          </div>
          
          <div class="calendar-grid">
            <div class="weekday">Sun</div>
            <div class="weekday">Mon</div>
            <div class="weekday">Tue</div>
            <div class="weekday">Wed</div>
            <div class="weekday">Thu</div>
            <div class="weekday">Fri</div>
            <div class="weekday">Sat</div>
            
            @for (day of calendarDays; track day.date) {
              <div class="calendar-day" 
                   [class.other-month]="!day.isCurrentMonth"
                   [class.today]="isToday(day.date)"
                   [class.is-sunday]="day.date.getDay() === 0"
                   [class.has-holiday]="day.holidays.length > 0">
                <span class="day-number">{{ day.date.getDate() }}</span>
                <div class="day-content">
                  @for (h of day.holidays; track h.id) {
                    <div class="holiday-pill" [class.national]="h.is_national" [class.weekly-off]="h.id === -1">
                      {{ h.name }}
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Sidebar Actions -->
        <div class="side-panel">
          @if (showNewHolidayForm) {
            <div class="card form-card">
              <h2 style="color: #0369a1;">Register Holiday</h2>
              <form (ngSubmit)="submitNewHoliday()" class="form-grid">
                <div class="form-group">
                  <label class="label">Event Title</label>
                  <input type="text" class="input" [(ngModel)]="newHoliday.name" name="name" required placeholder="e.g. Diwali" />
                </div>
                <div class="form-group">
                  <label class="label">Date</label>
                  <input type="date" class="input" [(ngModel)]="newHoliday.date" name="date" required />
                </div>
                <div class="form-group">
                  <label class="label">Classification</label>
                  <select [(ngModel)]="newHoliday.is_national" name="is_national" class="select">
                    <option [ngValue]="true">Statutory / National</option>
                    <option [ngValue]="false">Organizational</option>
                  </select>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-success">Save</button>
                  <button type="button" (click)="toggleNewHolidayForm()" class="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          }

          <div class="card upcoming-card">
            <h2 style="color: #0369a1;">Upcoming Events</h2>
            <div class="upcoming-list">
              @for (h of upcomingHolidays; track h.id) {
                <div class="upcoming-item" *ngIf="h.id !== -1">
                  <div class="u-date">
                    <span class="u-day">{{ getDay(h.date) }}</span>
                    <span class="u-month">{{ getMonth(h.date) }}</span>
                  </div>
                  <div class="u-info">
                    <h4>{{ h.name }}</h4>
                    <span class="u-type" [class.national]="h.is_national">
                      {{ h.is_national ? 'Statutory' : 'Corporate' }}
                    </span>
                  </div>
                  <button (click)="deleteHoliday(h.id)" class="delete-btn">×</button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 0; min-height: 100vh; background: #ffffff; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .grid-layout { display: grid; grid-template-columns: 1fr 380px; gap: 1.5rem; }
    .card { background: #ffffff; padding: 1.5rem; border-radius: 16px; border: 1px solid #e0f2fe; box-shadow: 0 4px 20px rgba(186, 230, 253, 0.15); }
    
    .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .nav-btn { background: #f0f9ff; border: 1px solid #bae6fd; color: #0369a1; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; font-weight: bold; }
    
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 12px; overflow: hidden; }
    
    .weekday { 
      padding: 1rem 0.5rem; 
      text-align: center; 
      background: #ffffff; 
      color: #0369a1; 
      font-size: 0.75rem; 
      font-weight: 800; 
      text-transform: uppercase; 
    }

    .calendar-day { 
      background: #f0f9ff; /* Light Blue/White Background */
      min-height: 110px; 
      padding: 0.6rem; 
      display: flex; 
      flex-direction: column; 
      gap: 0.5rem; 
    }

    /* SUNDAY RED COLOR */
    .calendar-day.is-sunday { 
      background: #fee2e2 !important; 
    }
    .calendar-day.is-sunday .day-number { 
      color: #e11d48 !important; 
      font-weight: 800;
    }

    /* HOLIDAY GREEN COLOR */
    .calendar-day.has-holiday { 
      background: #f0fdf4 !important; 
      border: 1px solid #bbf7d0;
    }
    .calendar-day.has-holiday .day-number { 
      color: #16a34a !important; 
      font-weight: 800;
    }

    .calendar-day.today { background: #eff6ff !important; border: 2px solid #3b82f6 !important; }
    .calendar-day.other-month { opacity: 0.3; }
    .day-number { font-size: 0.9rem; font-weight: 700; color: #64748b; }
    .day-content { display: flex; flex-direction: column; gap: 3px; }

    .holiday-pill { 
      font-size: 0.65rem; 
      padding: 0.25rem 0.5rem; 
      border-radius: 4px; 
      background: #dcfce7; 
      color: #166534; 
      font-weight: 700; 
      border-left: 3px solid #10b981; 
      white-space: nowrap; 
      overflow: hidden; 
      text-overflow: ellipsis; 
    }

    .holiday-pill.weekly-off { 
      background: #fee2e2; 
      color: #991b1b; 
      border-left-color: #ef4444; 
    }

    .label { color: #64748b; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; }
    .input, .select { background: #f8fbff; border: 1px solid #e0f2fe; color: #0369a1; border-radius: 10px; padding: 0.6rem; width: 100%; }

    .side-panel { display: flex; flex-direction: column; gap: 1.5rem; }
    .upcoming-item { display: flex; align-items: center; gap: 1rem; padding: 0.85rem; background: #ffffff; border-radius: 12px; border: 1px solid #e0eefc; position: relative; }
    .u-date { background: #3b82f6; color: #fff; padding: 0.4rem; border-radius: 8px; text-align: center; min-width: 45px; }
    .u-day { display: block; font-weight: 800; font-size: 1.1rem; line-height: 1; }
    .u-month { font-size: 0.6rem; text-transform: uppercase; font-weight: 700; }
    .u-type { font-size: 0.7rem; color: #10b981; font-weight: 700; }
    .u-type.national { color: #ef4444; }
    .delete-btn { position: absolute; right: 10px; top: 10px; background: none; border: none; color: #ef4444; font-size: 1.2rem; cursor: pointer; opacity: 0.4; }

    .btn { padding: 0.6rem 1.1rem; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; transition: all 0.2s; }
    .btn-primary { background: #3b82f6; color: #fff; }
    .btn-secondary { background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; }
    .btn-success { background: #10b981; color: #fff; width: 100%; }

    @media (max-width: 1200px) { .grid-layout { grid-template-columns: 1fr; } .side-panel { max-width: 500px; } }
  `]
})
export class HolidaysComponent implements OnInit {
  holidays: Holiday[] = [];
  upcomingHolidays: Holiday[] = [];
  viewDate = new Date();
  calendarDays: any[] = [];
  showNewHolidayForm = false;
  newHoliday = { name: '', date: '', description: '', is_national: true };

  constructor(private api: ApiService) {}
  ngOnInit() { this.loadHolidays(); }

  loadHolidays() {
    this.api.getHolidays().subscribe({
      next: (data) => {
        this.holidays = data;
        this.generateCalendar();
        this.updateUpcoming();
      }
    });
  }

  updateUpcoming() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.upcomingHolidays = this.holidays
      .filter(h => new Date(h.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }

  generateCalendar() {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const prevLastDay = new Date(year, month, 0);
    for (let i = firstDay.getDay(); i > 0; i--) {
      const d = new Date(year, month - 1, prevLastDay.getDate() - i + 1);
      days.push({ date: d, isCurrentMonth: false, holidays: this.getHolidaysForDay(d) });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true, holidays: this.getHolidaysForDay(d) });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false, holidays: this.getHolidaysForDay(d) });
    }
    this.calendarDays = days;
  }

  getHolidaysForDay(d: Date): any[] {
    const dayHolidays = this.holidays.filter(h => this.isSameDay(new Date(h.date), d));
    if (d.getDay() === 0) {
      dayHolidays.push({ id: -1, name: 'Weekly Off', date: d.toISOString(), is_national: false });
    }
    return dayHolidays;
  }

  hasNationalHoliday(holidays: any[]): boolean { return holidays.some(h => h.is_national); }
  isSameDay(d1: Date, d2: Date) { return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate(); }
  isToday(d: Date) { return this.isSameDay(d, new Date()); }
  prevMonth() { this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1); this.generateCalendar(); }
  nextMonth() { this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1); this.generateCalendar(); }
  getMonthName(d: Date) { return d.toLocaleString('default', { month: 'long' }); }
  toggleNewHolidayForm() { this.showNewHolidayForm = !this.showNewHolidayForm; }

  submitNewHoliday() {
    this.api.addHoliday(this.newHoliday).subscribe({
      next: () => {
        this.loadHolidays();
        this.showNewHolidayForm = false;
        this.newHoliday = { name: '', date: '', description: '', is_national: true };
      }
    });
  }

  seedIndianHolidays() {
    const samples = [
      { name: 'Republic Day', date: '2026-01-26', description: 'Statutory Holiday', is_national: true },
      { name: 'Holi Festival', date: '2026-03-04', description: 'Cultural Celebration', is_national: true },
      { name: 'Independence Day', date: '2026-08-15', description: 'Statutory Holiday', is_national: true },
      { name: 'Gandhi Jayanti', date: '2026-10-02', description: 'Statutory Holiday', is_national: true },
      { name: 'Diwali Lights', date: '2026-11-08', description: 'Cultural Celebration', is_national: true },
      { name: 'Christmas Day', date: '2026-12-25', description: 'Statutory Holiday', is_national: true }
    ];
    samples.forEach(h => this.api.addHoliday(h).subscribe({ next: () => this.loadHolidays() }));
  }

  deleteHoliday(id: number) {
    if (confirm('Delete this event record?')) {
      this.api.deleteHoliday(id).subscribe({ next: () => this.loadHolidays() });
    }
  }

  getDay(dateString: string): string { return new Date(dateString).getDate().toString().padStart(2, '0'); }
  getMonth(dateString: string): string { return new Date(dateString).toLocaleString('default', { month: 'short' }); }
}
