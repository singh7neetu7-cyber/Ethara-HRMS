import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService, Employee, EmployeeCreate, Department } from '../../services/api.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html',
})
export class EmployeesComponent implements OnInit {
  loading = false;
  listError: string | null = null;
  formError: string | null = null;
  successMessage: string | null = null;
  employees: Employee[] = [];
  departments: Department[] = [];
  form: EmployeeCreate = {
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
  };
  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadList();
    this.loadDepartments();
  }

  loadList(): void {
    this.loading = true;
    this.listError = null;
    this.api.getEmployees().subscribe({
      next: (list) => {
        this.employees = list;
        this.loading = false;
      },
      error: (err: string) => {
        this.listError = err;
        this.loading = false;
      },
    });
  }

  loadDepartments(): void {
    this.api.getDepartments().subscribe({
      next: (list) => this.departments = list,
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  onSubmit(): void {
    this.formError = null;
    this.successMessage = null;
    const payload: EmployeeCreate = {
      employee_id: this.form.employee_id.trim(),
      full_name: this.form.full_name.trim(),
      email: this.form.email.trim(),
      department: this.form.department.trim(),
    };
    if (!payload.employee_id || !payload.full_name || !payload.email || !payload.department) {
      this.formError = 'All fields are required.';
      return;
    }
    this.api.addEmployee(payload).subscribe({
      next: () => {
        this.successMessage = 'Employee added successfully.';
        this.form = { employee_id: '', full_name: '', email: '', department: '' };
        this.loadList();
      },
      error: (err: string) => {
        this.formError = err;
      },
    });
  }

  delete(emp: Employee): void {
    if (!confirm('Delete employee ' + emp.full_name + '?')) return;
    this.api.deleteEmployee(emp.id).subscribe({
      next: () => this.loadList(),
      error: (err: string) => {
        this.listError = err;
      },
    });
  }

  getDeptStyles(department: string): { [key: string]: string } {
    const d = department.toLowerCase();
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
