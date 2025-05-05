import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DropdownSearchEntityObjComponent } from '../../../../shared/components/dropdown-search-entity-obj/dropdown-search-entity-obj.component';
import { TagSelectorComponent } from '../../../../shared/components/tag-selector/tag-selector.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { IntegerOnlyDirective } from '../../../../shared/directives/integer-only/integer-only.directive';

import { LaboratoryService } from '../../../../core/laboratory/services/laboratory.service';
import { EquipmentService } from '../../../../core/equipment/services/equipment.service';
import { UserService } from '../../../../core/user/services/user.service';
import {
  EquipmentEndUseRequest,
  EquipmentStartUseRequest,
  EquipmentUseService,
} from '../../../../core/session/services/equipment-use.service';

import { Laboratory } from '../../../../core/laboratory/models/laboratory.model';
import { EquipmentDto } from '../../../../core/equipment/models/equipment-response.dto';
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
    TagSelectorComponent,
    ConfirmModalComponent,
    IntegerOnlyDirective,
  ],
})
export class RegisterSessionComponent implements AfterViewInit {
  private isBrowser = false;

  labs: Laboratory[] = [];
  labOptions: LabeledOption[] = [];
  equipmentOptions: LabeledOption[] = [];

  selectedLabId: string | null = null;
  selectedEquipment: string | null = null;

  selectedLabStatus: { active: boolean; remarks: string } | null = null;
  selectedEquipmentStatus: { active: boolean; remarks: string } | null = null;

  activeSessions: any[] = [];
  selectedSessionId: number | null = null;

  showConfirmationModal = false;
  showSummaryModal = false;
  isStartingSession = false;
  startSessionSuccess = false;
  startSessionError = false;

  hasActiveSessionWithEquipment: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private labService: LaboratoryService,
    private equipmentService: EquipmentService,
    private userService: UserService,
    private equipmentUseService: EquipmentUseService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadLabs();
    this.loadActiveSessions();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setInterval(() => this.updateUsageTime(), 1000);
    }
  }

  loadLabs() {
    this.labService.getLaboratories().subscribe((labs) => {
      this.labs = labs;
      this.labOptions = labs.map((lab) => ({
        label: `${lab.laboratoryName} - ${lab.location.locationName}`,
        value: String(lab.id),
      }));
    });
  }

  loadActiveSessions() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const username = JSON.parse(atob(token.split('.')[1]))[
      'preferred_username'
    ];

    this.userService
      .getUserByEmail(`${username}@uptc.edu.co`)
      .subscribe((user) => {
        this.equipmentUseService.getAllEquipmentUses().subscribe((uses) => {
          const userUses = uses.filter(
            (use: any) => use.user.id === user.id && use.isInUse === true
          );

          this.activeSessions = userUses.map((use: any) => {
            const [date, time] = use.startUseTime.split('T');

            return {
              id: use.id,
              equipmentId: use.equipment.id, // ✅ CORREGIDO
              lab: use.equipment.laboratory.laboratoryName,
              labLocation: use.equipment.laboratory.location.locationName,
              labLabel: `${use.equipment.laboratory.laboratoryName} - ${use.equipment.laboratory.location.locationName}`,

              equipment: use.equipment.equipmentName,
              equipmentInventoryNumber: use.equipment.inventoryNumber,
              equipmentLabel: `${use.equipment.equipmentName} - ${use.equipment.inventoryNumber}`,

              useDate: date,
              startUseTime: time,

              checkIn: {
                date: date,
                time: time,
                user: `${use.user.firstName} ${use.user.lastName}`,
              },

              checkOut: {
                verifiedStatus: '',
                usageStatus: '',
                usageDuration: '',
                sampleCount: use.samplesNumber ?? null,
                selectedFunctions: use.usedFunctions.map(
                  (f: any) => f.functionName
                ), // ✅ solo nombres visibles
                remarks: use.observations ?? '',
              },

              availableFunctions: use.equipment.functions, // ✅ objetos completos: { id, functionName }
            };
          });
        });
      });
  }

  onSelectLab(labId: string) {
    this.selectedLabId = labId;
    this.selectedEquipment = null;
    this.selectedEquipmentStatus = null;

    const selectedLab = this.labs.find((lab) => String(lab.id) === labId);
    this.selectedLabStatus = {
      active: selectedLab?.laboratoryAvailability ?? true,
      remarks:
        selectedLab?.laboratoryObservations || 'Sin observaciones registradas.',
    };

    if (!this.selectedLabStatus.active) {
      this.equipmentOptions = [];
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) return;
    const username = JSON.parse(atob(token.split('.')[1]))[
      'preferred_username'
    ];

    this.userService
      .getUserByEmail(`${username}@uptc.edu.co`)
      .subscribe((user) => {
        const authorizedEquipments = user.authorizedUserEquipments || [];
        const filtered = authorizedEquipments.filter(
          (eq: EquipmentDto) => String(eq.laboratory.id) === labId
        );
        this.equipmentOptions = filtered.map((eq) => ({
          label: `${eq.equipmentName} - ${eq.inventoryNumber}`,
          value: String(eq.id),
        }));
      });
  }

  onSelectEquipment(equipmentId: string) {
    this.selectedEquipment = equipmentId;

    // Verifica si el usuario ya tiene una sesión activa con este equipo
    this.hasActiveSessionWithEquipment = this.activeSessions.some(
      (s) => String(s.equipmentId) === equipmentId
    );

    // Si ya hay sesión activa, salimos sin marcar como inactivo
    if (this.hasActiveSessionWithEquipment) {
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const username = JSON.parse(atob(token.split('.')[1]))[
      'preferred_username'
    ];

    this.userService
      .getUserByEmail(`${username}@uptc.edu.co`)
      .subscribe((user) => {
        const authorizedEquipments = user.authorizedUserEquipments || [];

        const selected = authorizedEquipments.find(
          (eq: EquipmentDto) => String(eq.id) === equipmentId
        );

        this.selectedEquipmentStatus = {
          active: selected?.availability ?? true,
          remarks: selected?.observations || 'Sin observaciones registradas.',
        };
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
    const username = JSON.parse(atob(token.split('.')[1]))[
      'preferred_username'
    ];

    this.userService
      .getUserByEmail(`${username}@uptc.edu.co`)
      .subscribe((user) => {
        const payload: EquipmentStartUseRequest = {
          equipmentId: Number(this.selectedEquipment),
          userId: user.id,
        };

        this.equipmentUseService.startEquipmentUse(payload).subscribe({
          next: () => {
            this.startSessionSuccess = true;
            this.startSessionError = false;
            this.isStartingSession = false;
            this.loadActiveSessions();

            setTimeout(() => {
              this.showConfirmationModal = false;
              this.startSessionSuccess = false;
            }, 4000);
          },
          error: () => {
            this.startSessionSuccess = false;
            this.startSessionError = true;
            this.isStartingSession = false;
          },
        });
      });
  }

  cancelStartSession() {
    this.showConfirmationModal = false;
  }

  selectSession(sessionId: number) {
    this.selectedSessionId = sessionId;
  }

  resolveFunctionIds(session: any): number[] {
    // Suponiendo que session.availableFunctions se cargó como { id, functionName }
    return session.availableFunctions
      .filter((f: any) =>
        session.checkOut.selectedFunctions.includes(f.functionName)
      )
      .map((f: any) => f.id);
  }

  get selectedSession() {
    return this.activeSessions.find((s) => s.id === this.selectedSessionId);
  }

  updateUsageTime() {
    const session = this.selectedSession;
    if (session && session.checkIn.time) {
      const now = new Date();
      const sessionStart = new Date(
        `${session.checkIn.date}T${session.checkIn.time}`
      );
      const delta = new Date(now.getTime() - sessionStart.getTime());
      const h = delta.getUTCHours().toString().padStart(2, '0');
      const m = delta.getUTCMinutes().toString().padStart(2, '0');
      const s = delta.getUTCSeconds().toString().padStart(2, '0');
      session.checkOut.usageDuration = `${h}:${m}:${s}`;
    }
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

  onUsageStatusChange(): void {}

  autoResizeTextarea(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  get isFormValid(): boolean {
    const session = this.selectedSession;
    if (!session) return false;
    const hasVerified = !!session.checkOut.verifiedStatus;
    const hasUsage = !!session.checkOut.usageStatus;
    const hasSamples = session.checkOut.sampleCount !== null;
    const hasFunctions = session.checkOut.selectedFunctions.length > 0;
    const hasRemarks = session.checkOut.remarks.trim().length > 0;
    return (
      hasVerified &&
      hasUsage &&
      hasSamples &&
      hasFunctions &&
      (session.checkOut.usageStatus !== 'NO' || hasRemarks)
    );
  }

  finishSession() {
    this.updateUsageTime();
    this.showSummaryModal = true;
  }

  confirmFinishSession() {
    const session = this.selectedSession;
    if (!session) return;

    const usedFunctionIds: number[] = session.checkOut.selectedFunctions.map(
      (f: any) => f.id
    );

    const payload: EquipmentEndUseRequest = {
      isVerified: session.checkOut.verifiedStatus === 'YES',
      isAvailable: session.checkOut.usageStatus === 'YES',
      samplesNumber: session.checkOut.sampleCount || 0,
      usedFunctions: usedFunctionIds,
      observations: session.checkOut.remarks.trim(),
    };

    this.equipmentUseService.endEquipmentUse(session.id, payload).subscribe({
      next: () => {
        this.activeSessions = this.activeSessions.filter(
          (s) => s.id !== session.id
        );
        this.selectedSessionId = null;
        this.showSummaryModal = false;
      },
      error: () => {
        alert('❌ Error al finalizar la sesión.');
      },
    });
  }

  cancelFinishSession() {
    this.showSummaryModal = false;
  }
}
