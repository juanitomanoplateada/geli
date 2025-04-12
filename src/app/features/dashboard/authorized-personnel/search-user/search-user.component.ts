import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-user',
  imports: [FormsModule, CommonModule],
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.scss'],
  standalone: true,
})
export class SearchUserComponent {
  constructor(private router: Router) {}

  searchQuery = '';
  showAdvancedSearch = false;
  isLoading = false;

  filters = {
    estado: '',
    rol: '',
    startDate: '',
    endDate: '',
  };

  searchResults: any[] = [];

  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') this.onSearch();
  }

  onSearch() {
    this.isLoading = true;

    // Simulación de resultados base (podrías traerlos de un servicio en el futuro)
    const allUsers = [
      {
        nombre: 'Juan Pérez',
        identificacion: '12345678',
        estado: 'Activo',
        fechaAsignacionPA: new Date('2024-10-01'),
        fechaCreacion: new Date('2024-12-01'),
        fechaModificacion: new Date('2025-03-15'),
        rol: { nombre: 'Administrador' },
      },
      {
        nombre: 'María Gómez',
        identificacion: '87654321',
        estado: 'Inactivo',
        fechaAsignacionPA: new Date('2024-08-20'),
        fechaCreacion: new Date('2024-09-10'),
        fechaModificacion: new Date('2024-10-15'),
        rol: { nombre: 'Docente' },
      },
      // puedes añadir más registros simulados
    ];

    setTimeout(() => {
      const query = this.searchQuery.toLowerCase();
      const { estado, rol, startDate, endDate } = this.filters;

      this.searchResults = allUsers.filter((user) => {
        const matchesQuery =
          !query ||
          user.nombre.toLowerCase().includes(query) ||
          user.identificacion.includes(query);

        const matchesEstado = !estado || user.estado === estado;

        const matchesRol = !rol || user.rol.nombre === rol;

        const fechaCreacion = new Date(user.fechaCreacion);
        const desde = startDate ? new Date(startDate) : null;
        const hasta = endDate ? new Date(endDate) : null;

        const matchesDateRange =
          (!desde || fechaCreacion >= desde) &&
          (!hasta || fechaCreacion <= hasta);

        return matchesQuery && matchesEstado && matchesRol && matchesDateRange;
      });

      this.isLoading = false;
    }, 500);
  }

  toggleAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  clearFilters() {
    this.searchQuery = '';
    this.filters = { estado: '', rol: '', startDate: '', endDate: '' };
    this.searchResults = [];
  }

  trackById(index: number, item: any) {
    return item.identificacion;
  }

  goToUpdateUser(userId: string) {
    this.router.navigate(['/dashboard/update-user', userId]);
  }
}
