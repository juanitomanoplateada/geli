import {
  Component,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { TagSelectorComponent } from '../../../../shared/components/tag-selector/tag-selector.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { IntegerOnlyDirective } from '../../../../shared/directives/integer-only/integer-only.directive';

import { EquipmentUseService } from '../../../../core/services/session/equipment-use.service';
import { UserService } from '../../../../core/user/services/user.service';

import { Router } from '@angular/router';
import { Session } from '../../../../core/dto/session/session.dto';

@Component({
  selector: 'app-active-sessions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TagSelectorComponent,
    ConfirmModalComponent,
    IntegerOnlyDirective,
  ],
  templateUrl: './active-sessions.component.html',
  styleUrls: ['./active-sessions.component.scss'],
})
export class ActiveSessionsComponent implements AfterViewInit, OnDestroy {
  private isBrowser = false;
  private destroy$ = new Subject<void>();
  private intervalId: any;

  activeSessions: Session[] = [];
  selectedSessionId: number | null = null;

  showSummaryModal = false;
  currentUserName: string = '';

  isFinishingSession = false;
  finishSessionSuccess = false;
  finishSessionError = false;

  sessionSortDescending: boolean = true;
  equipmentIdsInUse: Set<string> = new Set();
  isLoading: boolean = true;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserService,
    private equipmentUseService: EquipmentUseService,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadInitialData();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.intervalId = setInterval(() => this.updateUsageTime(), 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSortOrder() {
    this.sessionSortDescending = !this.sessionSortDescending;
    this.sortSessions();
  }

  sortSessions() {
    const sorted = this.activeSessions.sort(
      (a, b) =>
        new Date(b.checkIn.date + 'T' + b.checkIn.time).getTime() -
        new Date(a.checkIn.date + 'T' + a.checkIn.time).getTime()
    );

    if (!this.sessionSortDescending) {
      sorted.reverse();
    }

    this.activeSessions = [...sorted];
  }

  loadActiveSessions() {
    this.isLoading = true;
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.isLoading = false;
      return;
    }

    try {
      const username = JSON.parse(atob(token.split('.')[1]))[
        'preferred_username'
      ];

      this.userService
        .getUserByEmail(`${username}@uptc.edu.co`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (user) => {
            const filterPayload = {
              isInUse: true,
              userId: user.id,
            };

            this.equipmentUseService
              .filter(filterPayload, 0, 9999)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (response) => {
                  this.processSessionData(response.content, user);
                  this.isLoading = false;
                },
                error: (err) => {
                  console.error('Error loading sessions:', err);
                  this.isLoading = false;
                },
              });
          },
          error: (err) => {
            console.error('Error getting user:', err);
            this.isLoading = false;
          },
        });
    } catch (e) {
      console.error('Error parsing token:', e);
      this.isLoading = false;
    }
  }

  private processSessionData(uses: any[], user: any) {
    this.equipmentIdsInUse.clear();
    this.currentUserName = `${user.firstName} ${user.lastName}`;

    this.activeSessions = uses.map((use) => {
      const [date, timeWithMs] = use.startUseTime.split('T');
      const time = timeWithMs.split('.')[0];

      this.equipmentIdsInUse.add(String(use.equipment.id));

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
          selectedFunctions: (use.usedFunctions ?? []).map(
            (f: any) => f.functionName
          ),
          remarks: use.observations ?? '',
        },
        availableFunctions: this.ensureNAFunction(use.equipment.functions),
      };
    });

    this.sortSessions(); // ordenar después de mapear
    if (this.activeSessions.length > 0 && !this.selectedSessionId) {
      this.selectedSessionId = this.activeSessions[0].id;
    }
  }

  loadInitialData() {
    this.loadActiveSessions();
  }

  private ensureNAFunction(functions: any[]): any[] {
    if (!functions || functions.length === 0) {
      return [{ id: -1, functionName: 'N/A' }];
    }

    const normalized = functions.map((f) => ({
      ...f,
      functionName: f.functionName?.trim() || 'N/A',
    }));

    const hasOnlyNA =
      normalized.length === 1 &&
      normalized[0].functionName.toUpperCase() === 'N/A';

    if (hasOnlyNA) {
      return normalized;
    }

    const hasNA = normalized.some(
      (f) => f.functionName.toUpperCase() === 'N/A'
    );
    const cleaned = normalized.filter(
      (f) => f.functionName.toUpperCase() !== 'N/A'
    );

    if (!hasNA) {
      cleaned.unshift({ id: -1, functionName: 'N/A' });
    }

    return cleaned;
  }

  selectSession(sessionId: number) {
    this.selectedSessionId = sessionId;
  }

  resolveFunctionIds(session: Session): number[] {
    return session.availableFunctions
      .filter((f) =>
        session.checkOut.selectedFunctions.includes(f.functionName)
      )
      .map((f) => f.id);
  }

  get selectedSession(): Session | undefined {
    return this.activeSessions.find((s) => s.id === this.selectedSessionId);
  }

  updateUsageTime() {
    const session = this.selectedSession;
    if (session && session.checkIn.time) {
      const now = new Date();
      const sessionStart = new Date(
        `${session.checkIn.date}T${session.checkIn.time}`
      );
      const diffMs = now.getTime() - sessionStart.getTime();

      const seconds = Math.floor((diffMs / 1000) % 60);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      const pad = (n: number) => n.toString().padStart(2, '0');

      let duration = '';
      if (days > 0) {
        duration = `${days}d ${pad(hours)}h:${pad(minutes)}m:${pad(seconds)}s`;
      } else if (hours > 0) {
        duration = `${pad(hours)}h:${pad(minutes)}m:${pad(seconds)}s`;
      } else if (minutes > 0) {
        duration = `${pad(minutes)}m:${pad(seconds)}s`;
      } else {
        duration = `${pad(seconds)}s`;
      }

      session.checkOut.usageDuration = duration;
    }
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

    return (
      !!session.checkOut.verifiedStatus &&
      !!session.checkOut.usageStatus &&
      session.checkOut.sampleCount !== null &&
      session.checkOut.selectedFunctions.length > 0 &&
      (session.checkOut.usageStatus !== 'NO' ||
        session.checkOut.remarks.trim().length > 0)
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

    const usedFunctionIds = this.resolveFunctionIds(session);

    const payload: any = {
      isVerified: session.checkOut.verifiedStatus === 'YES',
      isAvailable: session.checkOut.usageStatus === 'YES',
      samplesNumber: session.checkOut.sampleCount || 0,
      usedFunctions: usedFunctionIds,
      observations: session.checkOut.remarks.trim(),
    };

    this.equipmentUseService
      .endEquipmentUse(session.id, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.finishSessionSuccess = true;
          setTimeout(() => {
            this.loadActiveSessions();
            this.resetSessionState();
            this.router.navigate([
              '/dashboard/sessions/personal-session-history',
            ]);
          }, 2000);
        },
        error: () => {
          this.finishSessionError = true;
          this.isFinishingSession = false;
        },
      });
  }

  private resetSessionState() {
    this.selectedSessionId = null;
    this.showSummaryModal = false;
    this.isFinishingSession = false;
    this.finishSessionSuccess = false;
    this.finishSessionError = false;
  }

  cancelFinishSession() {
    this.showSummaryModal = false;
  }
}
