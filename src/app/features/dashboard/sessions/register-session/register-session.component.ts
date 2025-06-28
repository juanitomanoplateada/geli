import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DropdownSearchEntityObjComponent } from '../../../../shared/components/dropdown-search-entity-obj/dropdown-search-entity-obj.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

import { LaboratoryService } from '../../../../core/services/laboratory/laboratory.service';
import { UserService } from '../../../../core/user/services/user.service';
import { EquipmentService } from '../../../../core/services/equipment/equipment.service';
import {
  EquipmentStartUseRequest,
  EquipmentUseService,
} from '../../../../core/services/session/equipment-use.service';

import { Laboratory } from '../../../../core/laboratory/models/laboratory.model';
import { LabeledOption } from '../../../../shared/components/dropdown-search-entity-obj/dropdown-search-entity-obj.component';

@Component({
  selector: 'app-register-session',
  standalone: true,
  templateUrl: './register-session.component.html',
  styleUrls: ['./register-session.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    DropdownSearchEntityObjComponent,
    ConfirmModalComponent,
  ],
})
export class RegisterSessionComponent {
  labs: Laboratory[] = [];
  labOptions: LabeledOption[] = [];
  equipmentOptions: LabeledOption[] = [];

  selectedLabId: string | null = null;
  selectedEquipment: string | null = null;

  selectedLabStatus: { active: boolean; remarks: string } | null = null;
  selectedEquipmentStatus: { active: boolean; remarks: string } | null = null;

  showConfirmationModal = false;
  isStartingSession = false;
  startSessionSuccess = false;
  startSessionError = false;

  hasActiveSessionWithEquipment: boolean = false;
  currentUserName: string = '';
  equipmentIdsInUse: Set<string> = new Set();
  isEquipmentInUseByAnotherUser: boolean = false;

  isLoading = true;
  isLoadingEquipments = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private labService: LaboratoryService,
    private userService: UserService,
    private equipmentUseService: EquipmentUseService,
    private equipmentService: EquipmentService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadInitialData();
    }
  }

  loadInitialData() {
    this.isLoading = true;
    this.labService.getLaboratoriesAuthorizeds().subscribe((labs) => {
      this.labs = labs;
      this.labOptions = labs.map((lab) => ({
        label: `${lab.laboratoryName} - ${lab.location.locationName}`,
        value: String(lab.id),
      }));
      this.isLoading = false;
    });
  }

  onSelectLab(labId: string) {
    this.selectedLabId = labId;
    this.selectedEquipment = null;
    this.selectedEquipmentStatus = null;
    this.equipmentOptions = [];
    this.isLoadingEquipments = true;

    const selectedLab = this.labs.find((lab) => String(lab.id) === labId);
    this.selectedLabStatus = {
      active: selectedLab?.laboratoryAvailability ?? true,
      remarks:
        selectedLab?.laboratoryObservations || 'Sin observaciones registradas.',
    };

    if (!this.selectedLabStatus.active) {
      this.isLoadingEquipments = false;
      return;
    }

    this.equipmentService
      .getEquipmentsAuthorizeds(Number(labId))
      .subscribe((equipments) => {
        this.equipmentOptions = equipments.map((eq) => ({
          label: `${eq.equipmentName} - ${eq.inventoryNumber}`,
          value: String(eq.id),
        }));
        this.isLoadingEquipments = false;
      });

    this.hasActiveSessionWithEquipment = false;
    this.isEquipmentInUseByAnotherUser = false;
  }

  onSelectEquipment(equipmentId: string) {
    this.selectedEquipment = equipmentId;

    this.equipmentService
      .getEquipmentAvailability(Number(equipmentId))
      .subscribe({
        next: (statusDto) => {
          this.selectedEquipmentStatus = {
            active: statusDto.active,
            remarks: statusDto.message || 'Sin observaciones registradas.',
          };
        },
        error: (err) => {
          console.error('Error al consultar disponibilidad del equipo:', err);
        },
      });

    this.equipmentUseService
      .getEquipmentAvailability(Number(equipmentId))
      .subscribe({
        next: (statusDto) => {
          this.hasActiveSessionWithEquipment =
            statusDto.status === 'IN_USE_BY_YOU';
          this.isEquipmentInUseByAnotherUser =
            statusDto.status === 'IN_USE_BY_ANOTHER';
          setTimeout(() => {}, 3000);
        },
        error: (err) => {
          console.error('Error al verificar disponibilidad del equipo:', err);
        },
      });
  }

  onStartSessionClick() {
    this.showConfirmationModal = true;
  }

  confirmStartSession() {
    if (!this.selectedLabId || !this.selectedEquipment) return;

    this.isStartingSession = true;
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const payload: EquipmentStartUseRequest = {
      equipmentId: Number(this.selectedEquipment),
      userId: 0,
    };

    this.equipmentUseService.startEquipmentUse(payload).subscribe({
      next: () => {
        this.startSessionSuccess = true;
        this.startSessionError = false;
        setTimeout(() => {
          this.resetSession();
        }, 4000);
      },
      error: () => {
        this.startSessionSuccess = false;
        this.startSessionError = true;
        this.isStartingSession = false;
      },
    });
  }

  cancelStartSession() {
    this.showConfirmationModal = false;
  }

  private resetSession() {
    this.isStartingSession = false;
    this.showConfirmationModal = false;
    this.startSessionSuccess = false;
    this.selectedLabId = null;
    this.selectedEquipment = null;
    this.selectedLabStatus = null;
    this.selectedEquipmentStatus = null;
    this.hasActiveSessionWithEquipment = false;
    this.equipmentOptions = [];
  }

  getLabLabel(id: string | null): string {
    return (
      this.labOptions.find((opt) => opt.value === id)?.label ||
      'Laboratorio desconocido'
    );
  }

  getEquipmentLabel(id: string | null): string {
    return (
      this.equipmentOptions.find((opt) => opt.value === id)?.label ||
      'Equipo desconocido'
    );
  }
}
