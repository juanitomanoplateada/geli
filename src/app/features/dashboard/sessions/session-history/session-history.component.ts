import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Session {
  id: number;
  lab: string;
  equipment: string;
  date: string;
  time: string;
  user: string;
  available: string;
  remarks?: string;
  purpose?: string;
  procedures?: string;
  functionsUsed?: string[];
  observations?: string;
}

@Component({
  selector: 'app-session-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './session-history.component.html',
  styleUrls: ['./session-history.component.scss'],
})
export class SessionHistoryComponent {
  searchQuery = '';
  isLoading = false;
  showAdvancedSearch = false;
  selectedSession: Session | null = null;

  // ✅ Datos de sesión actual
  userRole: 'PERSONAL_AUTORIZADO' | 'ANALISTA_CALIDAD' = 'PERSONAL_AUTORIZADO';
  currentUser: string = 'LOPEZ GARCIA';

  filters = {
    available: '',
    function: '',
    lab: '',
  };

  availableFunctions = ['Medición', 'Calibración', 'Alimentación continua'];
  availableLabs = ['Laboratorio de DRX', 'Laboratorio de Electrónica'];

  sessions: Session[] = [
    {
      id: 1,
      lab: 'Laboratorio de DRX',
      equipment: 'Difractómetro PANalytical',
      date: '2025-04-09',
      time: '08:30',
      user: 'RAMIREZ RAMIREZ',
      available: 'Yes',
      remarks: 'All good',
      purpose: 'Caracterización de muestra mineral',
      procedures: 'Análisis de difracción de rayos X',
      functionsUsed: ['Medición', 'Calibración'],
      observations: 'Equipo en buen estado',
    },
    {
      id: 2,
      lab: 'Laboratorio de Electrónica',
      equipment: 'Fuente DC BK Precision',
      date: '2025-04-08',
      time: '10:45',
      user: 'LOPEZ GARCIA',
      available: 'No',
      remarks: 'Equipo fuera de servicio',
      purpose: 'Prueba de circuitos amplificadores',
      procedures: 'Conexión de fuentes, medición de voltajes',
      functionsUsed: ['Alimentación continua'],
      observations: 'Fuente sin salida en canal 2',
    },
  ];

  get filteredSessions(): Session[] {
    return this.sessions.filter((s) => {
      // ✅ Filtrado por rol
      if (
        this.userRole === 'PERSONAL_AUTORIZADO' &&
        s.user !== this.currentUser
      ) {
        return false;
      }

      const matchesQuery =
        s.lab.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.equipment.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesAvailability =
        !this.filters.available || s.available === this.filters.available;

      const matchesFunction =
        !this.filters.function || s.functionsUsed?.includes(this.filters.function);

      const matchesLab = !this.filters.lab || s.lab === this.filters.lab;

      return (
        matchesQuery && matchesAvailability && matchesFunction && matchesLab
      );
    });
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  onSearch() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 400);
  }

  toggleAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  clearFilters() {
    this.filters = { available: '', function: '', lab: '' };
    this.searchQuery = '';
    this.onSearch();
  }

  selectSession(session: Session) {
    this.selectedSession = session;
  }
}
