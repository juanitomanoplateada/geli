import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-session.component.html',
  styleUrls: ['./register-session.component.scss'],
})
export class RegisterSessionComponent implements AfterViewInit {
  private isBrowser = false;

  sessionActive = false;

  selectedLab: string | null = null;
  selectedEquipment: string | null = null;

  showLabDropdown = false;
  showEquipmentDropdown = false;

  labSearch = '';
  equipmentSearch = '';

  laboratories = [
    {
      name: 'Laboratorio DRX',
      equipments: ['Difractómetro PANalytical', 'Detector Si(Li)'],
    },
    {
      name: 'Laboratorio Electrónica',
      equipments: ['Osciloscopio Tektronix', 'Fuente DC BK Precision'],
    },
  ];

  showConfirmationModal = false;

  checkIn = { date: '', time: '', user: 'RAAA' };
  checkOut = { sampleCount: null, functions: '', remarks: '' };

  availabilityStatus = '';
  showCheckoutFields = false;
  checkInTime: Date | null = null;
  usageDuration = '';

  availableFunctions: string[] = [
    'Calibración',
    'Medición de Muestra',
    'Revisión de Espectro',
    'Configuración de Equipo',
    'Análisis de Datos',
    'Ajuste de Parámetros',
  ];

  selectedFunctions: string[] = [];
  showFunctionDropdown = false;
  functionSearch = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setInterval(() => this.updateUsageTime(), 1000);
    }
  }

  onStartSessionClick() {
    this.showConfirmationModal = true;
  }

  confirmStartSession() {
    const now = new Date();
    this.checkIn.date = now.toLocaleDateString();
    this.checkIn.time = now.toLocaleTimeString();
    this.checkInTime = now;
    this.sessionActive = true;
    this.showConfirmationModal = false;
  }

  cancelStartSession() {
    this.showConfirmationModal = false;
  }

  toggleLabDropdown() {
    this.showLabDropdown = !this.showLabDropdown;
    this.labSearch = '';
  }

  toggleEquipmentDropdown() {
    this.showEquipmentDropdown = !this.showEquipmentDropdown;
    this.equipmentSearch = '';
  }

  selectLab(lab: { name: string }) {
    this.selectedLab = lab.name;
    this.selectedEquipment = null;
    this.showLabDropdown = false;
  }

  selectEquipment(equipment: string) {
    this.selectedEquipment = equipment;
    this.showEquipmentDropdown = false;
  }

  get filteredLabs() {
    return this.laboratories.filter((lab) =>
      lab.name.toLowerCase().includes(this.labSearch.toLowerCase())
    );
  }

  get filteredEquipments() {
    const lab = this.laboratories.find((l) => l.name === this.selectedLab);
    if (!lab) return [];
    return lab.equipments.filter((e) =>
      e.toLowerCase().includes(this.equipmentSearch.toLowerCase())
    );
  }

  confirmSessionStart() {
    const confirmStart = confirm(
      '¿Desea iniciar la sesión con el equipo/patrón seleccionado?'
    );
    if (confirmStart) {
      const now = new Date();
      this.checkIn.date = now.toLocaleDateString();
      this.checkIn.time = now.toLocaleTimeString();
      this.checkInTime = now;
      this.sessionActive = true;
    }
  }

  updateUsageTime() {
    if (this.sessionActive && this.checkInTime) {
      const now = new Date();
      const delta = new Date(now.getTime() - this.checkInTime.getTime());
      const h = delta.getUTCHours().toString().padStart(2, '0');
      const m = delta.getUTCMinutes().toString().padStart(2, '0');
      const s = delta.getUTCSeconds().toString().padStart(2, '0');
      this.usageDuration = `${h}:${m}:${s}`;
    }
  }

  onAvailabilityChange() {
    this.showCheckoutFields = this.availabilityStatus === 'Yes';
    this.updateUsageTime();
  }

  get isFormValid(): boolean {
    if (!this.availabilityStatus) return false;
    const hasSamples = this.checkOut.sampleCount !== null;
    const hasFunctions = this.selectedFunctions.length > 0;
    const hasRemarks = this.checkOut.remarks.trim().length > 0;

    if (this.availabilityStatus === 'Yes') return hasSamples && hasFunctions;
    return hasSamples && hasFunctions && hasRemarks;
  }

  get filteredFunctions(): string[] {
    return this.availableFunctions.filter(
      (func) =>
        func.toLowerCase().includes(this.functionSearch.toLowerCase()) &&
        !this.selectedFunctions.includes(func)
    );
  }

  toggleFunctionDropdown() {
    this.showFunctionDropdown = !this.showFunctionDropdown;
    this.functionSearch = '';
  }

  selectFunction(func: string) {
    this.selectedFunctions.push(func);
    this.functionSearch = '';
    this.showFunctionDropdown = false;
  }

  removeFunction(func: string) {
    this.selectedFunctions = this.selectedFunctions.filter((f) => f !== func);
  }

  autoResizeTextarea(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  finishSession() {
    this.updateUsageTime();
    alert('Sesión finalizada exitosamente.');
    console.log('Entrada:', this.checkIn);
    console.log('Salida:', {
      uso: this.usageDuration,
      muestras: this.checkOut.sampleCount,
      funciones: this.selectedFunctions,
      observaciones: this.checkOut.remarks,
    });

    this.sessionActive = false;
    this.selectedLab = null;
    this.selectedEquipment = null;
    this.availabilityStatus = '';
    this.checkInTime = null;
    this.usageDuration = '';
    this.checkOut = { sampleCount: null, functions: '', remarks: '' };
    this.selectedFunctions = [];
  }
}
