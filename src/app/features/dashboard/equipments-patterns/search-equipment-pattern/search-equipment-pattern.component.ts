import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-equipment-pattern',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-equipment-pattern.component.html',
  styleUrls: ['./search-equipment-pattern.component.scss'],
})
export class SearchEquipmentPatternComponent {
  constructor(private router: Router) {}

  searchQuery = '';
  showAdvancedSearch = false;
  isLoading = false;

  filters = {
    disponibilidad: '',
    funcion: '',
    laboratorio: '',
  };

  funcionesDisponibles: string[] = ['Medición', 'Computación', 'Proyección'];
  disponibilidades: string[] = ['Disponible', 'No disponible'];
  laboratoriosDisponibles: string[] = ['Lab Redes', 'Lab Electrónica'];

  searchResults: any[] = [];

  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') this.onSearch();
  }

  onSearch() {
    this.isLoading = true;

    const allEquipments = [
      {
        id: 1,
        nombre: 'Multímetro',
        marca: 'Fluke',
        numeroInventario: 'INV-001',
        disponibilidad: 'Disponible',
        funcion: { nombre: 'Medición' },
        laboratorio: { nombre: 'Lab Electrónica' },
      },
      {
        id: 2,
        nombre: 'Computador HP',
        marca: 'HP',
        numeroInventario: 'INV-002',
        disponibilidad: 'No disponible',
        funcion: { nombre: 'Computación' },
        laboratorio: { nombre: 'Lab Redes' },
      },
    ];

    setTimeout(() => {
      const query = this.searchQuery.toLowerCase();
      const { disponibilidad, funcion, laboratorio } = this.filters;

      this.searchResults = allEquipments.filter((equipo) => {
        const matchesQuery =
          !query ||
          equipo.nombre.toLowerCase().includes(query) ||
          equipo.marca.toLowerCase().includes(query) ||
          equipo.numeroInventario.toLowerCase().includes(query);

        const matchesDisponibilidad =
          !disponibilidad || equipo.disponibilidad === disponibilidad;

        const matchesFuncion = !funcion || equipo.funcion.nombre === funcion;

        const matchesLaboratorio =
          !laboratorio || equipo.laboratorio.nombre === laboratorio;

        return (
          matchesQuery &&
          matchesDisponibilidad &&
          matchesFuncion &&
          matchesLaboratorio
        );
      });

      this.isLoading = false;
    }, 500);
  }

  toggleAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  clearFilters() {
    this.searchQuery = '';
    this.filters = {
      disponibilidad: '',
      funcion: '',
      laboratorio: '',
    };
    this.searchResults = [];
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  goToUpdateEquipment(id: number) {
    this.router.navigate(['/dashboard/update-equipment', id]);
  }
}
