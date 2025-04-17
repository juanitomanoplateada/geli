import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IntegerOnlyDirective } from '../../../../shared/integer-only/integer-only.directive';
import { UppercaseDirective } from '../../../../shared/uppercase/uppercase.directive';

interface SessionRecord {
  id: number;
  lab: string;
  equipment: string;
  date: string;
  time: string;
  verifiedStatus: string;
  responsible: string;
  email: string;
  usageStatus: string;
  usageDuration?: number;
  sampleCount?: number;
  functionsUsed?: string[];
  observations?: string;
}

@Component({
  selector: 'app-personal-session-history',
  standalone: true,
  imports: [CommonModule, FormsModule, IntegerOnlyDirective, UppercaseDirective],
  templateUrl: './personal-session-history.component.html',
  styleUrls: ['./personal-session-history.component.scss'],
})
export class PersonalSessionHistoryComponent {
  // Estado general
  searchQuery = '';
  isLoading = false;
  showAdvancedSearch = false;
  selectedSession: SessionRecord | null = null;

  // Filtros avanzados
  filters = {
    lab: '',
    equipment: '',
    dateFrom: '',
    dateTo: '',
    timeFrom: '',
    timeTo: '',
    verifiedStatus: '',
    usageStatus: '',
    usageDurationMin: null as number | null,
    usageDurationMax: null as number | null,
    sampleCountMin: null as number | null,
    sampleCountMax: null as number | null,
    function: '',
  };

  // Registros de sesiones
  sessionRecords: SessionRecord[] = [
    {
      id: 1,
      lab: 'Laboratorio de DRX',
      equipment: 'Difractómetro PANalytical',
      date: '2025-04-09',
      time: '08:30',
      verifiedStatus: 'SI',
      responsible: 'RAMIREZ RAMIREZ',
      email: 'ramirez@uptc.edu.co',
      usageStatus: 'Disponible',
      usageDuration: 120,
      sampleCount: 5,
      functionsUsed: ['Medición', 'Calibración'],
      observations: 'Equipo en buen estado',
    },
    {
      id: 2,
      lab: 'Laboratorio de Electrónica',
      equipment: 'Fuente DC BK Precision',
      date: '2025-04-08',
      time: '10:45',
      verifiedStatus: 'NO',
      responsible: 'LOPEZ GARCIA',
      email: 'lopez@uptc.edu.co',
      usageStatus: 'No disponible',
      usageDuration: 60,
      sampleCount: 3,
      functionsUsed: ['Alimentación continua'],
      observations: 'Fuente sin salida en canal 2',
    },
  ];

  // Dropdowns dinámicos
  showLabDropdown = false;
  showEquipmentDropdown = false;
  showFunctionDropdown = false;

  labSearch = '';
  equipmentSearch = '';
  functionSearch = '';

  availableLabs = ['Laboratorio de DRX', 'Laboratorio de Electrónica'];
  availableEquipments = [
    'Difractómetro PANalytical',
    'Fuente DC BK Precision',
    'Osciloscopio Tektronix',
  ];
  availableFunctions = ['Medición', 'Calibración', 'Alimentación continua'];

  // Filtros con buscador
  get filteredLabs() {
    return this.availableLabs.filter((lab) =>
      lab.toLowerCase().includes(this.labSearch.toLowerCase())
    );
  }

  get filteredEquipments() {
    return this.availableEquipments.filter((eq) =>
      eq.toLowerCase().includes(this.equipmentSearch.toLowerCase())
    );
  }

  get filteredFunctions() {
    return this.availableFunctions.filter((f) =>
      f.toLowerCase().includes(this.functionSearch.toLowerCase())
    );
  }

  // Aplicar filtros sobre las sesiones
  get filteredSessions(): SessionRecord[] {
    return this.sessionRecords.filter((session) => {
      const matchesQuery =
        session.lab.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        session.equipment
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());

      const matchesLab =
        !this.filters.lab ||
        session.lab.toLowerCase() === this.filters.lab.toLowerCase();

      const matchesEquipment =
        !this.filters.equipment ||
        session.equipment.toLowerCase() ===
          this.filters.equipment.toLowerCase();

      const matchesDateFrom =
        !this.filters.dateFrom || session.date >= this.filters.dateFrom;

      const matchesDateTo =
        !this.filters.dateTo || session.date <= this.filters.dateTo;

      const matchesTimeFrom =
        !this.filters.timeFrom || session.time >= this.filters.timeFrom;

      const matchesTimeTo =
        !this.filters.timeTo || session.time <= this.filters.timeTo;

      const matchesVerifiedStatus =
        !this.filters.verifiedStatus ||
        session.verifiedStatus.toLowerCase() ===
          this.filters.verifiedStatus.toLowerCase();

      const matchesUsageStatus =
        !this.filters.usageStatus ||
        session.usageStatus.toLowerCase() ===
          this.filters.usageStatus.toLowerCase();

      const matchesUsageDuration =
        (!this.filters.usageDurationMin ||
          session.usageDuration! >= this.filters.usageDurationMin) &&
        (!this.filters.usageDurationMax ||
          session.usageDuration! <= this.filters.usageDurationMax);

      const matchesSampleCount =
        (!this.filters.sampleCountMin ||
          session.sampleCount! >= this.filters.sampleCountMin) &&
        (!this.filters.sampleCountMax ||
          session.sampleCount! <= this.filters.sampleCountMax);

      const matchesFunction =
        !this.filters.function ||
        session.functionsUsed?.some(
          (f) => f.toLowerCase() === this.filters.function.toLowerCase()
        );

      return (
        matchesQuery &&
        matchesLab &&
        matchesEquipment &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesTimeFrom &&
        matchesTimeTo &&
        matchesVerifiedStatus &&
        matchesUsageStatus &&
        matchesUsageDuration &&
        matchesSampleCount &&
        matchesFunction
      );
    });
  }

  // Buscar manualmente o por cambio
  onSearch() {
    this.isLoading = true;
    setTimeout(() => (this.isLoading = false), 300);
  }

  // Buscar con Enter
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') this.onSearch();
  }

  // Mostrar/Ocultar filtros
  toggleAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  // Seleccionar sesión para mostrar detalles
  selectSession(session: SessionRecord) {
    this.selectedSession = session;
  }

  // Limpiar todos los filtros y cerrar dropdowns
  clearFilters() {
    this.filters = {
      lab: '',
      equipment: '',
      dateFrom: '',
      dateTo: '',
      timeFrom: '',
      timeTo: '',
      verifiedStatus: '',
      usageStatus: '',
      usageDurationMin: null,
      usageDurationMax: null,
      sampleCountMin: null,
      sampleCountMax: null,
      function: '',
    };
    this.labSearch = '';
    this.equipmentSearch = '';
    this.functionSearch = '';
    this.showLabDropdown = false;
    this.showEquipmentDropdown = false;
    this.showFunctionDropdown = false;
    this.searchQuery = '';
    this.onSearch();
  }
}
