import { Router } from '@angular/router';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Components
import { DropdownSearchEntityObjComponent } from '../../../../shared/components/dropdown-search-entity-obj/dropdown-search-entity-obj.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

// Services
import { LaboratoryService } from '../../../../core/services/laboratory/laboratory.service';
import { EquipmentService } from '../../../../core/services/equipment/equipment.service';
import { EquipmentUseService } from '../../../../core/services/session/equipment-use.service';

// Models
import { LabeledOption } from '../../../../shared/components/dropdown-search-entity-obj/dropdown-search-entity-obj.component';
import { Laboratory } from '../../../../core/dto/laboratory/laboratory.dto';
import { AuthTokenService } from '../../../../core/auth/services/auth-token.service';
import { EquipmentStartUseRequest } from '../../../../core/dto/session/start-session-request.dto';
import { LaboratoryHelperService } from '../../../../core/helpers/laboratory/laboratory-helper.service';
import { EquipmentHelperService } from '../../../../core/helpers/equipment/equipment-helper.service';

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
  // State variables
  isLoading = true;
  isLoadingEquipments = false;
  isStartingSession = false;
  showConfirmationModal = false;
  startSessionSuccess = false;
  startSessionError = false;
  hasActiveSessionWithEquipment = false;
  isEquipmentInUseByAnotherUser = false;
  noAuthorizedLabs = false;
  isCheckingAvailability = false;

  // Data variables
  labs: Laboratory[] = [];
  labOptions: LabeledOption[] = [];
  equipmentOptions: LabeledOption[] = [];
  equipmentIdsInUse: Set<string> = new Set();
  currentUserName: string = '';

  // Selection variables
  selectedLabId: string | null = null;
  selectedEquipment: string | null = null;
  selectedLabStatus: { active: boolean; remarks: string } | null = null;
  selectedEquipmentStatus: { active: boolean; remarks: string } | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private labService: LaboratoryService,
    private equipmentUseService: EquipmentUseService,
    private equipmentService: EquipmentService,
    private authTokenService: AuthTokenService,
    private laboratoryHelper: LaboratoryHelperService,
    private equipmentHelper: EquipmentHelperService,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadInitialData();
    }
  }

  // Initialization methods
  private loadInitialData(): void {
    this.isLoading = true;
    this.currentUserName = this.authTokenService.getUserName();

    this.labService.getLaboratoriesAuthorizeds().subscribe({
      next: (labs) => {
        this.labs = labs;
        this.labOptions = this.laboratoryHelper.toLabeledOptions(labs);
        this.noAuthorizedLabs = labs.length === 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar laboratorios autorizados:', err);
        this.noAuthorizedLabs = true;
        this.isLoading = false;
      },
    });
  }

  // Selection handlers
  onSelectLab(labId: string): void {
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

    this.equipmentService.getEquipmentsAuthorizeds(Number(labId)).subscribe({
      next: (equipments) => {
        this.equipmentOptions = this.equipmentHelper.toLabeledOptions(
          equipments ?? []
        );
        this.isLoadingEquipments = false;
      },
      error: (err) => {
        console.error('Error al cargar equipos autorizados:', err);
        this.equipmentOptions = [];
        this.isLoadingEquipments = false;
      },
    });

    this.hasActiveSessionWithEquipment = false;
    this.isEquipmentInUseByAnotherUser = false;
  }

  onSelectEquipment(equipmentId: string): void {
    this.selectedEquipment = equipmentId;
    this.isCheckingAvailability = true;

    this.selectedEquipmentStatus = null;
    this.hasActiveSessionWithEquipment = false;
    this.isEquipmentInUseByAnotherUser = false;

    let availabilityChecked = false;
    let usageChecked = false;

    const stopLoadingIfDone = () => {
      if (availabilityChecked && usageChecked) {
        this.isCheckingAvailability = false;
      }
    };

    this.equipmentService
      .getEquipmentAvailability(Number(equipmentId))
      .subscribe({
        next: (statusDto) => {
          this.selectedEquipmentStatus =
            this.equipmentHelper.parseEquipmentStatus(statusDto);
        },
        error: (err) => {
          console.error('Error al consultar disponibilidad del equipo:', err);
        },
        complete: () => {
          availabilityChecked = true;
          stopLoadingIfDone();
        },
      });

    this.equipmentUseService
      .getEquipmentAvailability(Number(equipmentId))
      .subscribe({
        next: (statusDto) => {
          const usage = this.equipmentHelper.parseUsageStatus(statusDto);
          this.hasActiveSessionWithEquipment = usage.usedByYou;
          this.isEquipmentInUseByAnotherUser = usage.usedByAnother;
        },
        error: (err) => {
          console.error('Error al verificar disponibilidad del equipo:', err);
        },
        complete: () => {
          usageChecked = true;
          stopLoadingIfDone();
        },
      });
  }

  // Session management methods
  onStartSessionClick(): void {
    this.showConfirmationModal = true;
  }

  confirmStartSession(): void {
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
          this.router.navigate(['/dashboard/sessions/active-sessions']);
        }, 3000);
      },
      error: () => {
        this.startSessionSuccess = false;
        this.startSessionError = true;
        this.isStartingSession = false;
      },
    });
  }

  cancelStartSession(): void {
    this.showConfirmationModal = false;
  }

  private resetSession(): void {
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

  // Helper methods
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
