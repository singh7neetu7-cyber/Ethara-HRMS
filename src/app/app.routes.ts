import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { LeavesComponent } from './pages/leaves/leaves.component';
import { DepartmentsComponent } from './pages/departments/departments.component';
import { HolidaysComponent } from './pages/holidays/holidays.component';
import { ReportsComponent } from './pages/reports/reports.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'employees', component: EmployeesComponent },
  { path: 'attendance', component: AttendanceComponent },
  { path: 'leaves', component: LeavesComponent },
  { path: 'departments', component: DepartmentsComponent },
  { path: 'holidays', component: HolidaysComponent },
  { path: 'reports', component: ReportsComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
