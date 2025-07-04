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
import { Router } from '@angular/router';

// Components
import { TagSelectorComponent } from '../../../../shared/components/tag-selector/tag-selector.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

// Services
import { EquipmentUseService } from '../../../../core/services/session/equipment-use.service';
import { EquipmentService } from '../../../../core/services/equipment/equipment.service';

// Models and Directives
import { Session } from '../../../../core/dto/session/session.dto';
import { InputRulesDirective } from '../../../../shared/directives/input-rules/input-rules';
import { UserService } from '../../../../core/services/user/user.service';

@Component({
  selector: 'app-active-sessions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TagSelectorComponent,
    ConfirmModalComponent,
    InputRulesDirective,
  ],
  templateUrl: './active-sessions.component.html',
  styleUrls: ['./active-sessions.component.scss'],
})
export class ActiveSessionsComponent implements AfterViewInit, OnDestroy {
  // Properties
  private isBrowser = false;
  private destroy$ = new Subject<void>();
  private intervalId: any;

  // Session Data
  activeSessions: Session[] = [];
  selectedSessionId: number | null = null;
  equipmentIdsInUse: Set<string> = new Set();

  // User Data
  currentUserName: string = '';

  // UI State
  showSummaryModal = false;
  isFinishingSession = false;
  finishSessionSuccess = false;
  finishSessionError = false;
  sessionSortDescending: boolean = true;
  isLoading: boolean = true;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserService,
    private equipmentUseService: EquipmentUseService,
    private equipmentService: EquipmentService,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadInitialData();
  }

  // Lifecycle Hooks
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

  // Initialization Methods
  private loadInitialData() {
    this.loadActiveSessions();
  }

  // Session Data Methods
  private loadActiveSessions() {
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

    this.sortSessions();
    if (this.activeSessions.length > 0 && !this.selectedSessionId) {
      this.selectSession(this.activeSessions[0].id);
    }
  }

  // Session Selection Methods
  selectSession(sessionId: number): void {
    this.selectedSessionId = sessionId;
    const session = this.activeSessions.find((s) => s.id === sessionId);

    if (!session) return;

    this.equipmentService
      .getFunctionsById(Number(session.equipmentId))
      .subscribe((res) => {
        session.availableFunctions = res.functions;
      });
  }

  get selectedSession(): Session | undefined {
    return this.activeSessions.find((s) => s.id === this.selectedSessionId);
  }

  // Sorting Methods
  toggleSortOrder() {
    this.sessionSortDescending = !this.sessionSortDescending;
    this.sortSessions();
  }

  private sortSessions() {
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

  // Timer Methods
  private updateUsageTime() {
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

  // Form Handling Methods
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

  // Session Finish Methods
  finishSession() {
    this.updateUsageTime();
    this.showSummaryModal = true;
    const session = this.selectedSession;
    if (!session) return;
    console.log(session?.checkOut?.selectedFunctions);
  }

  confirmFinishSession() {
    const session = this.selectedSession;
    if (!session) return;

    this.isFinishingSession = true;
    this.finishSessionSuccess = false;
    this.finishSessionError = false;

    const selectedFunctionIds =
      session?.checkOut?.selectedFunctions?.map((func) => func.id) || [];

    const payload: any = {
      isVerified: session.checkOut.verifiedStatus === 'YES',
      isAvailable: session.checkOut.usageStatus === 'YES',
      samplesNumber: session.checkOut.sampleCount || 0,
      usedFunctions: selectedFunctionIds,
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

  cancelFinishSession() {
    this.showSummaryModal = false;
  }

  private resetSessionState() {
    this.selectedSessionId = null;
    this.showSummaryModal = false;
    this.isFinishingSession = false;
    this.finishSessionSuccess = false;
    this.finishSessionError = false;
  }

  // Utility Methods
  private ensureNAFunction(functions: any[]): any[] {
    if (!functions || functions.length === 0) {
      return [{ id: -1, functionName: 'NO APLICA' }];
    }

    const normalized = functions.map((f) => ({
      ...f,
      functionName: f.functionName?.trim() || 'NO APLICA',
    }));

    const hasOnlyNA =
      normalized.length === 1 &&
      normalized[0].functionName.toUpperCase() === 'NO APLICA';

    if (hasOnlyNA) {
      return normalized;
    }

    const hasNA = normalized.some(
      (f) => f.functionName.toUpperCase() === 'NO APLICA'
    );
    const cleaned = normalized.filter(
      (f) => f.functionName.toUpperCase() !== 'NO APLICA'
    );

    if (!hasNA) {
      cleaned.unshift({ id: -1, functionName: 'NO APLICA' });
    }

    return cleaned;
  }

  getSelectedFunctionNames(): string {
    const selected = this.selectedSession?.checkOut?.selectedFunctions || [];
    return selected.length > 0
      ? selected.map((f) => f.functionName).join(', ')
      : 'NO APLICA';
  }
}
