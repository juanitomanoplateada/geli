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

  currentUserName: string = '';

  isFinishingSession = false;
  finishSessionSuccess = false;
  finishSessionError = false;

  sessionSortDescending: boolean = true;

  equipmentIdsInUse: Set<string> = new Set();
  isEquipmentInUseByAnotherUser: boolean = false;

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

  toggleSortOrder() {
    this.sessionSortDescending = !this.sessionSortDescending;
    this.loadActiveSessions();
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
          this.equipmentIdsInUse.clear();
          this.currentUserName = `${user.firstName} ${user.lastName}`;
          const userUses = uses.filter(
            (use: any) => use.user.id === user.id && use.isInUse === true
          );

          const sorted = userUses.sort(
            (a: any, b: any) =>
              new Date(b.startUseTime).getTime() -
              new Date(a.startUseTime).getTime()
          );

          const ordered = this.sessionSortDescending
            ? sorted
            : sorted.reverse();

          uses
            .filter((use: any) => use.isInUse === true)
            .forEach((use: any) =>
              this.equipmentIdsInUse.add(String(use.equipment.id))
            );

          this.activeSessions = ordered.map((use: any) => {
            const [date, timeWithMs] = use.startUseTime.split('T');
            const time = timeWithMs.split('.')[0]; // Recorta milisegundos

            return {
              id: use.id,
              equipmentId: use.equipment.id,
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
                ),
                remarks: use.observations ?? '',
              },

              availableFunctions: this.ensureNAFunction(
                use.equipment.functions
              ),
            };
          });
        });
      });
  }

  private ensureNAFunction(functions: any[]): any[] {
    const normalized = functions.map((f) => ({
      ...f,
      functionName: f.functionName.trim(),
    }));

    const hasOnlyNA =
      normalized.length === 1 &&
      normalized[0].functionName.toUpperCase() === 'N/A';

    if (hasOnlyNA) {
      return normalized; // ✅ dejar solo N/A si es la única
    }

    const hasNA = normalized.some(
      (f) => f.functionName.toUpperCase() === 'N/A'
    );

    const cleaned = normalized.filter(
      (f) => f.functionName.toUpperCase() !== 'N/A'
    );

    // ✅ Si no tenía N/A, lo agregamos
    if (!hasNA) {
      cleaned.unshift({ id: -1, functionName: 'N/A' });
    }

    return cleaned;
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
    this.isEquipmentInUseByAnotherUser =
      this.equipmentIdsInUse.has(equipmentId) &&
      !this.hasActiveSessionWithEquipment;
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

            this.loadActiveSessions();

            setTimeout(() => {
              // Solo después de 4 segundos se permite volver a usar el botón
              this.isStartingSession = false;
              this.showConfirmationModal = false;
              this.startSessionSuccess = false;

              // Reset fields
              this.selectedLabId = null;
              this.selectedEquipment = null;
              this.selectedLabStatus = null;
              this.selectedEquipmentStatus = null;
              this.hasActiveSessionWithEquipment = false;
              this.equipmentOptions = [];
            }, 4000);
          },
          error: () => {
            this.startSessionSuccess = false;
            this.startSessionError = true;
            this.isStartingSession = false; // ❗ Solo se reactiva si falló
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

    this.isFinishingSession = true;
    this.finishSessionSuccess = false;
    this.finishSessionError = false;

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
        this.finishSessionSuccess = true;
        this.finishSessionError = false;

        setTimeout(() => {
          this.activeSessions = this.activeSessions.filter(
            (s) => s.id !== session.id
          );
          this.selectedSessionId = null;
          this.showSummaryModal = false;
          this.isFinishingSession = false;
          this.finishSessionSuccess = false;
        }, 4000);
      },
      error: () => {
        this.finishSessionSuccess = false;
        this.finishSessionError = true;
        this.isFinishingSession = false;
      },
    });
  }

  cancelFinishSession() {
    this.showSummaryModal = false;
  }
}
