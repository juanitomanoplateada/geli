import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-session.component.html',
  styleUrls: ['./register-session.component.scss'],
})
export class RegisterSessionComponent {
  sessionStarted = false;
  showLabDropdown = false;
  showEquipmentDropdown = false;

  selectedLab: string | null = null;
  selectedEquipment: string | null = null;

  labSearch = '';
  equipmentSearch = '';

  availabilityStatus = '';
  showCheckoutFields = false;

  checkInTime: Date | null = null;
  usageDuration = '';

  laboratories = [
    {
      name: 'DRX Laboratory',
      equipments: ['PANalytical Diffractometer', 'Si(Li) Detector'],
    },
    {
      name: 'Electronics Laboratory',
      equipments: ['Tektronix Oscilloscope', 'BK Precision DC Power Supply'],
    },
  ];

  checkIn = {
    date: '',
    time: '',
    user: 'Current User',
  };

  checkOut = {
    sampleCount: null,
    functions: '',
    remarks: '',
  };

  availableFunctions: string[] = [
    'Calibration',
    'Sample Measurement',
    'Spectrum Review',
    'Equipment Setup',
    'Data Analysis',
    'Parameter Adjustment',
  ];

  selectedFunctions: string[] = [];

  showFunctionDropdown = false;
  functionSearch = '';

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

  startSession() {
    const now = new Date();
    this.checkIn.date = now.toLocaleDateString();
    this.checkIn.time = now.toLocaleTimeString();
    this.checkInTime = now;
    this.sessionStarted = true;
  }

  onAvailabilityChange(value: string) {
    this.availabilityStatus = value;
    this.showCheckoutFields = value === 'Yes';
    this.calculateUsageTime();
  }

  calculateUsageTime() {
    if (this.checkInTime) {
      const now = new Date();
      const delta = new Date(now.getTime() - this.checkInTime.getTime());
      const hours = delta.getUTCHours().toString().padStart(2, '0');
      const minutes = delta.getUTCMinutes().toString().padStart(2, '0');
      const seconds = delta.getUTCSeconds().toString().padStart(2, '0');
      this.usageDuration = `${hours}:${minutes}:${seconds}`;
    }
  }

  get isFormValid(): boolean {
    if (!this.availabilityStatus) return false;

    if (this.availabilityStatus === 'No') {
      return this.countWords(this.checkOut.remarks || '') >= 5;
    }

    if (this.availabilityStatus === 'Yes') {
      return !!this.checkOut.sampleCount && this.selectedFunctions.length > 0;
    }

    return false;
  }

  countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
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

  finishSession() {
    this.calculateUsageTime();

    console.log('Check-in:', this.checkIn);
    console.log('Check-out:', {
      usageTime: this.usageDuration,
      ...this.checkOut,
    });
    alert('Session finished successfully.');
    this.sessionStarted = false;

    // Reset
    this.availabilityStatus = '';
    this.showCheckoutFields = false;
    this.checkOut = {
      sampleCount: null,
      functions: '',
      remarks: '',
    };
    this.selectedLab = null;
    this.selectedEquipment = null;
    this.usageDuration = '';
    this.checkInTime = null;
    this.selectedFunctions = [];
  }
}
