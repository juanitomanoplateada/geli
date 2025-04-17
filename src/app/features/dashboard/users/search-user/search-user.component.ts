import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface UserRecord {
  name: string;
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  assignedAt: Date;
  role: {
    name: string;
  };
}

type DateFieldKeys = 'createdAt' | 'updatedAt' | 'assignedAt';

@Component({
  selector: 'app-search-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.scss'],
})
export class SearchUserComponent {
  constructor(private router: Router) {}

  query = '';
  showFilters = false;
  loading = false;

  filters = {
    status: '',
    role: '',
    startDate: '',
    endDate: '',
    dateType: 'createdAt' as DateFieldKeys,
  };

  results: UserRecord[] = [];

  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') this.performSearch();
  }

  performSearch() {
    this.loading = true;

    const mockUsers: UserRecord[] = [
      {
        name: 'Juan Pérez',
        id: '12345678',
        status: 'Activo',
        assignedAt: new Date('2024-10-01'),
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2025-03-15'),
        role: { name: 'Personal Autorizado' },
      },
      {
        name: 'María Gómez',
        id: '87654321',
        status: 'Inactivo',
        assignedAt: new Date('2024-08-20'),
        createdAt: new Date('2024-09-10'),
        updatedAt: new Date('2024-10-15'),
        role: { name: 'Analista de Calidad' },
      },
    ];

    setTimeout(() => {
      const { status, role, startDate, endDate, dateType } = this.filters;
      const keyword = this.query.toLowerCase();

      this.results = mockUsers.filter((user: UserRecord) => {
        const matchesKeyword =
          !keyword ||
          user.name.toLowerCase().includes(keyword) ||
          user.id.includes(keyword);

        const matchesStatus = !status || user.status === status;
        const matchesRole = !role || user.role.name === role;

        const dateField = user[dateType];
        const from = startDate ? new Date(startDate) : null;
        const to = endDate ? new Date(endDate) : null;

        const matchesDate =
          (!from || dateField >= from) && (!to || dateField <= to);

        return matchesKeyword && matchesStatus && matchesRole && matchesDate;
      });

      this.loading = false;
    }, 500);
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  resetSearch() {
    this.query = '';
    this.filters = {
      status: '',
      role: '',
      dateType: 'createdAt',
      startDate: '',
      endDate: '',
    };
    this.results = [];
  }

  trackByUserId(index: number, user: UserRecord) {
    return user.id;
  }

  goToEditUser(userId: string) {
    this.router.navigate(['/dashboard/update-user', userId]);
  }
}
