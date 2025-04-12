import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-laboratory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-laboratory.component.html',
  styleUrls: ['./search-laboratory.component.scss'],
})
export class SearchLaboratoryComponent {
  constructor(private router: Router) {}

  searchQuery = '';
  showAdvancedSearch = false;
  isLoading = false;
  ubicacionesDisponibles: string[] = [
    'Edificio A - Piso 2',
    'Edificio B - Piso 1',
  ];

  filters = {
    disponibilidad: '',
    ubicacion: '',
  };

  searchResults: any[] = [];

  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') this.onSearch();
  }

  onSearch() {
    this.isLoading = true;

    const allLabs = [
      {
        id: 1,
        nombre: 'Lab Redes',
        descripcion: 'Laboratorio de Redes y Comunicaciones',
        disponibilidad: 'Disponible',
        ubicacion: { nombre: 'Edificio A - Piso 2' },
        equipos: [],
      },
      {
        id: 2,
        nombre: 'Lab Electrónica',
        descripcion: 'Laboratorio de circuitos',
        disponibilidad: 'No disponible',
        ubicacion: { nombre: 'Edificio B - Piso 1' },
        equipos: [],
      },
    ];

    setTimeout(() => {
      const query = this.searchQuery.toLowerCase();
      const { disponibilidad, ubicacion } = this.filters;

      this.searchResults = allLabs.filter((lab) => {
        const matchesQuery =
          !query ||
          lab.nombre.toLowerCase().includes(query) ||
          lab.descripcion.toLowerCase().includes(query);

        const matchesDisponibilidad =
          !disponibilidad || lab.disponibilidad === disponibilidad;

        const matchesUbicacion =
          !ubicacion ||
          lab.ubicacion.nombre.toLowerCase().includes(ubicacion.toLowerCase());

        return matchesQuery && matchesDisponibilidad && matchesUbicacion;
      });

      this.isLoading = false;
    }, 500);
  }

  toggleAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  clearFilters() {
    this.searchQuery = '';
    this.filters = { disponibilidad: '', ubicacion: '' };
    this.searchResults = [];
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  goToUpdateLaboratory(id: number) {
    this.router.navigate(['/dashboard/update-laboratory', id]);
  }
}
