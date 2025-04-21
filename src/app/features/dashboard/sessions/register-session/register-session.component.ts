import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownSearchComponent } from '../../../../shared/components/dropdown-search/dropdown-search.component';
import { TagSelectorComponent } from '../../../../shared/components/tag-selector/tag-selector.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { IntegerOnlyDirective } from '../../../../shared/directives/integer-only/integer-only.directive';

@Component({
  selector: 'app-register-session',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmModalComponent,
    DropdownSearchComponent,
    TagSelectorComponent,
    IntegerOnlyDirective,
  ],
  templateUrl: './register-session.component.html',
  styleUrls: ['./register-session.component.scss'],
})
export class RegisterSessionComponent implements AfterViewInit {
  private isBrowser = false;

  sessionActive = false;
  selectedLab: string | null = null;
  selectedEquipment: string | null = null;

  showConfirmationModal = false;
  showSummaryModal = false;

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

  get labNames(): string[] {
    return this.laboratories.map((lab) => lab.name);
  }

  get equipmentOptions(): string[] {
    const selected = this.laboratories.find((l) => l.name === this.selectedLab);
    return selected ? selected.equipments : [];
  }

  checkIn = { date: '', time: '', user: 'RAAA' };
  checkOut = { sampleCount: null, functions: '', remarks: '' };

  availabilityStatus = '';
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

  selectLab(lab: { name: string }) {
    this.selectedLab = lab.name;
    this.selectedEquipment = null;
  }

  selectEquipment(equipment: string) {
    this.selectedEquipment = equipment;
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

  autoResizeTextarea(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  finishSession() {
    this.updateUsageTime();
    this.showSummaryModal = true;
  }

  cancelFinishSession() {
    this.showSummaryModal = false;
  }

  confirmFinishSession() {
    this.showSummaryModal = false;
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
