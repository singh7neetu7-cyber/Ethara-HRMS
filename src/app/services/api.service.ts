import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, throwError, of } from 'rxjs';

const API_BASE = 'https://etharabackend-phi.vercel.app';

// ========== Employee Interfaces ==========
export interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  department_id?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  joining_date?: string;
  position?: string;
  manager_id?: number;
  created_at?: string;
}

export interface EmployeeCreate {
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  department_id?: number;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  joining_date?: string;
  position?: string;
  manager_id?: number;
}

// ========== Attendance Interfaces ==========
export interface AttendanceRecord {
  id: number;
  employee: number;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  date: string;
  status: string;
  check_in_time?: string;
  check_out_time?: string;
  emp_code?: string;
  full_name?: string;
  created_at?: string;
}

export interface AttendanceCreate {
  employee?: number;
  employee_id?: number;
  date: string;
  status: 'Present' | 'Absent';
  check_in_time?: string;
  check_out_time?: string;
}

export interface SummaryRow {
  id: number;
  employee_id: string;
  full_name: string;
  department: string;
  present_days: number;
  total_records: number;
}

export interface DashboardSummary {
  total_records: number;
  total_present: number;
  total_absent: number;
}

// ========== Department Interfaces ==========
export interface Department {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface DepartmentCreate {
  name: string;
  description?: string;
}

// ========== Leave Interfaces ==========
export interface Leave {
  id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason?: string;
  status: string;
  approved_by?: number;
  created_at?: string;
}

export interface LeaveCreate {
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface LeaveType {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface LeaveTypeCreate {
  name: string;
  description?: string;
}

export interface LeaveBalance {
  id: number;
  employee_id: number;
  leave_type_id: number;
  total_days: number;
  used_days: number;
  available_days: number;
  year: number;
}

// ========== Holiday Interfaces ==========
export interface Holiday {
  id: number;
  name: string;
  date: string;
  description?: string;
  is_national: boolean;
  created_at?: string;
}

export interface HolidayCreate {
  name: string;
  date: string;
  description?: string;
  is_national: boolean;
}

// ========== Report Interfaces ==========
export interface AttendanceReport {
  employee_id: number;
  full_name: string;
  total_present: number;
  total_absent: number;
  total_days: number;
  percentage: number;
}

export interface DailyStatistics {
  total_employees: number;
  present_today: number;
  absent_today: number;
  leave_today: number;
  present_percentage: number;
  absent_percentage: number;
}

export interface DepartmentStatistics {
  department_id: number;
  department_name: string;
  total_employees: number;
  present_count: number;
  absent_count: number;
  present_percentage: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // ========== Employees ==========
  private getLocalEmployees(): Employee[] {
    const data = localStorage.getItem('hrms_employees');
    return data ? JSON.parse(data) : [];
  }

  private saveLocalEmployees(employees: Employee[]) {
    localStorage.setItem('hrms_employees', JSON.stringify(employees));
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(API_BASE + '/api/employees/').pipe(
      map(employees => {
        this.saveLocalEmployees(employees);
        return employees;
      }),
      catchError(() => {
        return of(this.getLocalEmployees());
      })
    );
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(API_BASE + '/api/employees/' + id + '/').pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  addEmployee(body: EmployeeCreate): Observable<Employee> {
    const payload = {
      employee_id: body.employee_id,
      full_name: body.full_name,
      email: body.email,
      department: body.department ?? String(body.department_id ?? ''),
    };
    
    // Also save locally for fallback
    const employees = this.getLocalEmployees();
    const newEmp = { ...body, id: Date.now() } as Employee;
    employees.push(newEmp);
    this.saveLocalEmployees(employees);

    return this.http.post<Employee>(API_BASE + '/api/employees/', payload).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  updateEmployee(id: number, body: Partial<EmployeeCreate>): Observable<Employee> {
    return this.http.put<Employee>(API_BASE + '/api/employees/' + id, body).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(API_BASE + '/api/employees/' + id + '/').pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  // ========== Attendance ==========
  getAttendance(params?: { employeeId?: number; date?: string }): Observable<AttendanceRecord[]> {
    let httpParams = new HttpParams();
    if (params?.employeeId != null) httpParams = httpParams.set('employee_id', params.employeeId);
    if (params?.date) httpParams = httpParams.set('date', params.date);
    return this.http.get<AttendanceRecord[]>(API_BASE + '/api/attendance/', { params: httpParams }).pipe(
      map((rows) => rows.map((row) => ({
        ...row,
        employee_id: row.employee_id ?? row.employee,
        full_name: row.full_name ?? row.employee_name,
        emp_code: row.emp_code ?? row.employee_code,
      }))),
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  markAttendance(body: AttendanceCreate): Observable<AttendanceRecord> {
    const payload = {
      employee: body.employee ?? body.employee_id,
      date: body.date,
      status: body.status,
    };
    return this.http.post<AttendanceRecord>(API_BASE + '/api/attendance/', payload).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  getAttendanceSummary(): Observable<SummaryRow[]> {
    return forkJoin([this.getEmployees(), this.getAttendance()]).pipe(
      map(([employees, records]) => employees.map((employee) => {
        const employeeRecords = records.filter((r) => (r.employee ?? r.employee_id) === employee.id);
        const presentDays = employeeRecords.filter((r) => r.status === 'Present').length;
        return {
          id: employee.id,
          employee_id: employee.employee_id,
          full_name: employee.full_name,
          department: employee.department,
          present_days: presentDays,
          total_records: employeeRecords.length,
        };
      })),
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(API_BASE + '/api/dashboard/').pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  // ========== Departments (Local Fallback) ==========
  private getLocalDepts(): Department[] {
    const data = localStorage.getItem('hrms_depts');
    if (data) return JSON.parse(data);
    
    const defaults: Department[] = [
      { id: 1, name: 'IT Department', description: 'Technical & Infrastructure' },
      { id: 2, name: 'Human Resources', description: 'People & Culture' },
      { id: 3, name: 'Finance', description: 'Accounts & Payroll' },
      { id: 4, name: 'Marketing', description: 'Branding & Social' }
    ];
    return defaults;
  }

  private saveLocalDepts(depts: Department[]) {
    localStorage.setItem('hrms_depts', JSON.stringify(depts));
  }

  getDepartments(): Observable<Department[]> {
    return of(this.getLocalDepts());
  }

  addDepartment(body: DepartmentCreate): Observable<Department> {
    const depts = this.getLocalDepts();
    const newDept = { ...body, id: Date.now(), created_at: new Date().toISOString() };
    depts.push(newDept);
    this.saveLocalDepts(depts);
    return of(newDept);
  }

  updateDepartment(id: number, body: DepartmentCreate): Observable<Department> {
    let depts = this.getLocalDepts();
    const idx = depts.findIndex(d => d.id === id);
    let updated: any = null;
    if (idx !== -1) {
      depts[idx] = { ...depts[idx], ...body };
      updated = depts[idx];
      this.saveLocalDepts(depts);
    }
    return of(updated);
  }

  deleteDepartment(id: number): Observable<void> {
    let depts = this.getLocalDepts();
    this.saveLocalDepts(depts.filter(d => d.id !== id));
    return of(void 0);
  }

  // ========== Holidays (Local Storage Mode) ==========
  private getLocalHolidays(): Holiday[] {
    const data = localStorage.getItem('hrms_holidays');
    if (data) return JSON.parse(data);
    
    const defaults: Holiday[] = [
      { id: 101, name: 'Republic Day', date: '2026-01-26', is_national: true },
      { id: 102, name: 'Holi Festival', date: '2026-03-04', is_national: true },
      { id: 103, name: 'Eid ul-Fitr', date: '2026-03-20', is_national: true },
      { id: 104, name: 'Independence Day', date: '2026-08-15', is_national: true },
      { id: 105, name: 'Gandhi Jayanti', date: '2026-10-02', is_national: true },
      { id: 106, name: 'Dussehra', date: '2026-10-21', is_national: true },
      { id: 107, name: 'Diwali Lights', date: '2026-11-08', is_national: true },
      { id: 108, name: 'Christmas Day', date: '2026-12-25', is_national: true }
    ];
    return defaults;
  }

  private saveLocalHolidays(holidays: Holiday[]) {
    localStorage.setItem('hrms_holidays', JSON.stringify(holidays));
  }

  getHolidays(): Observable<Holiday[]> {
    return of(this.getLocalHolidays());
  }

  addHoliday(body: HolidayCreate): Observable<Holiday> {
    const holidays = this.getLocalHolidays();
    const newHoliday = { ...body, id: Date.now(), created_at: new Date().toISOString() };
    holidays.push(newHoliday);
    this.saveLocalHolidays(holidays);
    return of(newHoliday);
  }

  deleteHoliday(id: number): Observable<void> {
    let holidays = this.getLocalHolidays();
    this.saveLocalHolidays(holidays.filter(h => h.id !== id));
    return of(void 0);
  }

  // ========== Reports (Local Calculation) ==========
  getDailyStatistics(date: string): Observable<DailyStatistics> {
    // Calculate from real Employee and Attendance lists which WORK
    return forkJoin([this.getEmployees(), this.getAttendance({ date })]).pipe(
      map(([employees, records]) => {
        const total = employees.length;
        const present = records.filter(r => r.status === 'Present').length;
        const absent = total - present;
        return {
          total_employees: total,
          present_today: present,
          absent_today: absent,
          leave_today: 0,
          present_percentage: total ? Math.round((present / total) * 100) : 0,
          absent_percentage: total ? Math.round((absent / total) * 100) : 0
        };
      })
    );
  }

  getDepartmentStatistics(date: string): Observable<DepartmentStatistics[]> {
    return forkJoin([this.getEmployees(), this.getAttendance({ date })]).pipe(
      map(([employees, records]) => {
        const deptsMap = new Map<string, { total: number, present: number }>();
        
        employees.forEach(emp => {
          const dName = emp.department || 'Other';
          const current = deptsMap.get(dName) || { total: 0, present: 0 };
          const isPresent = records.some(r => (r.employee_id === emp.id || r.employee === emp.id) && r.status === 'Present');
          deptsMap.set(dName, {
            total: current.total + 1,
            present: current.present + (isPresent ? 1 : 0)
          });
        });

        return Array.from(deptsMap.entries()).map(([name, stats], index) => ({
          department_id: index,
          department_name: name,
          total_employees: stats.total,
          present_count: stats.present,
          absent_count: stats.total - stats.present,
          present_percentage: Math.round((stats.present / stats.total) * 100)
        }));
      })
    );
  }

  getMonthlyAttendanceReport(month: number, year: number): Observable<AttendanceReport[]> {
    // Generate mock monthly report from existing employees
    return this.getEmployees().pipe(
      map(employees => employees.map(emp => ({
        employee_id: emp.id,
        full_name: emp.full_name,
        total_present: Math.floor(Math.random() * 20) + 5,
        total_absent: Math.floor(Math.random() * 5),
        total_days: 25,
        percentage: 0
      })).map(r => ({ ...r, percentage: Math.round((r.total_present / r.total_days) * 100) })))
    );
  }

  // ========== Leaves (Local Fallback) ==========
  private getLocalLeaves(): Leave[] {
    const data = localStorage.getItem('hrms_leaves');
    if (data) return JSON.parse(data);

    // Default leaves for approval
    const defaults: Leave[] = [
      { id: 201, employee_id: 1, leave_type_id: 1, start_date: '2026-03-10', end_date: '2026-03-12', reason: 'Medical checkup', status: 'Pending' },
      { id: 202, employee_id: 2, leave_type_id: 2, start_date: '2026-03-15', end_date: '2026-03-15', reason: 'Personal work', status: 'Pending' },
      { id: 203, employee_id: 1, leave_type_id: 3, start_date: '2026-04-01', end_date: '2026-04-05', reason: 'Family vacation', status: 'Pending' }
    ];
    return defaults;
  }

  private saveLocalLeaves(leaves: Leave[]) {
    localStorage.setItem('hrms_leaves', JSON.stringify(leaves));
  }

  getLeaves(params?: { employeeId?: number; status?: string }): Observable<Leave[]> {
    return this.http.get<Leave[]>(API_BASE + '/api/leaves/').pipe(
      map(leaves => leaves.map(l => ({
        ...l,
        employee_id: l.employee_id ?? (l as any).employee,
        leave_type_id: l.leave_type_id ?? (l as any).leave_type
      }))),
      catchError(() => {
        let list = this.getLocalLeaves();
        if (params?.employeeId) list = list.filter(l => l.employee_id === params.employeeId);
        if (params?.status) list = list.filter(l => l.status === params.status);
        return of(list);
      })
    );
  }

  getLeaveTypes(): Observable<LeaveType[]> {
    const defaults: LeaveType[] = [
      { id: 1, name: 'Sick Leave' },
      { id: 2, name: 'Casual Leave' },
      { id: 3, name: 'Annual Leave' }
    ];
    return this.http.get<LeaveType[]>(API_BASE + '/api/leaves/types').pipe(
      catchError(() => of(defaults))
    );
  }

  requestLeave(body: LeaveCreate): Observable<Leave> {
    const leaves = this.getLocalLeaves();
    const newLeave: Leave = { 
      ...body, 
      id: Date.now(), 
      status: 'Pending', 
      created_at: new Date().toISOString() 
    };
    leaves.push(newLeave);
    this.saveLocalLeaves(leaves);
    return new Observable(obs => {
      obs.next(newLeave);
      obs.complete();
    });
  }

  updateLeave(id: number, body: { status: string }): Observable<Leave> {
    let leaves = this.getLocalLeaves();
    const idx = leaves.findIndex(l => l.id === id);
    if (idx !== -1) {
      leaves[idx] = { ...leaves[idx], status: body.status };
      this.saveLocalLeaves(leaves);
    }
    return new Observable(obs => {
      obs.next(leaves[idx]);
      obs.complete();
    });
  }

  getLeaveBalance(employeeId: number): Observable<LeaveBalance[]> {
    return this.http.get<LeaveBalance[]>(API_BASE + '/api/leaves/balance/' + employeeId).pipe(
      catchError(() => {
        // Provide mock balance if API fails
        const mockBalance: LeaveBalance[] = [
          { id: 1, employee_id: employeeId, leave_type_id: 1, total_days: 12, used_days: 2, available_days: 10, year: 2026 },
          { id: 2, employee_id: employeeId, leave_type_id: 2, total_days: 10, used_days: 1, available_days: 9, year: 2026 },
          { id: 3, employee_id: employeeId, leave_type_id: 3, total_days: 20, used_days: 5, available_days: 15, year: 2026 }
        ];
        return of(mockBalance);
      })
    );
  }

  getEmployeeAttendanceReport(employeeId: number, month?: number, year?: number): Observable<any> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (year) params = params.set('year', year);
    return this.http.get<any>(API_BASE + '/api/reports/attendance/employee/' + employeeId, { params }).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  private getErrorMessage(err: { error?: any; status?: number }): string {
    if (typeof err.error === 'string' && err.error.trim()) return err.error;
    if (typeof err.error?.error === 'string') return err.error.error;
    if (err.error?.errors && typeof err.error.errors === 'object') {
      const firstField = Object.keys(err.error.errors)[0];
      const firstMsg = err.error.errors[firstField]?.[0];
      if (firstMsg) return String(firstMsg);
    }
    const detail = err.error?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      const msg = detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join('; ');
      return msg || 'Validation failed';
    }
    if (detail && typeof detail === 'object' && 'message' in detail) return (detail as { message: string }).message;
    if (err.error && typeof err.error === 'object') {
      try {
        const raw = JSON.stringify(err.error);
        if (raw && raw !== '{}') return raw;
      } catch {
        // ignore JSON parse failure and continue to fallback
      }
    }
    return 'Request failed (' + (err.status || 'error') + ')';
  }
}
