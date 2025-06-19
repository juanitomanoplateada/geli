import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { DropdownSearchEntityComponent } from '../../../../shared/components/dropdown-search-entity/dropdown-search-entity.component';

import { UserService } from '../../../../core/services/user/user.service';
import { PositionService } from '../../../../core/services/position/position.service';
import { PositionDto } from '../../../../core/dto/position/position-response.dto';

interface UpdateUserRequest {
  isActive: boolean;
  positionId?: number;
  positionName?: string;
}

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmModalComponent,
    DropdownSearchEntityComponent
],
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.scss'],
})
export class UpdateUserComponent implements OnInit {
  userId!: number;
  creationDate!: string;
  modificationDate!: string;

  readonly availableRoles = ['PERSONAL AUTORIZADO', 'ANALISTA DE CALIDAD'];
  readonly availableStatuses = ['ACTIVO', 'INACTIVO'];

  availablePositionsList: {
    label: string;
    value: { id: number; positionName: string };
  }[] = [];

  selectedPosition: { id: number; positionName: string } | null = null;
  proposedPositionName: string | null = null;

  showConfirmationModal = false;
  feedbackMessage: string | null = null;
  feedbackSuccess = false;
  isSubmitting = false;
  isLoading = true;

  userForm = this.fb.group({
    email: [
      { value: '', disabled: true },
      [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+$/)],
    ],
    firstName: [{ value: '', disabled: true }, Validators.required],
    lastName: [{ value: '', disabled: true }, Validators.required],
    identification: [{ value: '', disabled: true }, Validators.required],
    role: [{ value: '', disabled: true }, Validators.required],
    positionName: ['', Validators.required],
    status: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private positionService: PositionService
  ) {}

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPositions();
  }

  private loadPositions(): void {
    this.positionService.getAll().subscribe({
      next: (positions) => {
        if (!positions) {
          this.availablePositionsList = [];
          return;
        }
        this.availablePositionsList = positions.map((p) => ({
          label: p.positionName,
          value: { id: p.id, positionName: p.positionName },
        }));
        this.loadUser();
      },
      error: (err) => {
        console.error('Error cargando posiciones:', err);
      },
    });
  }

  private loadUser() {
    this.userService.getUserById(this.userId).subscribe((user) => {
      this.creationDate = user.creationDate;
      this.modificationDate = user.modificationStatusDate;

      this.userForm.patchValue({
        email: this.extractPrefix(user.email),
        firstName: user.firstName,
        lastName: user.lastName,
        identification: user.identification,
        role: this.mapRoleToSpanish(user.role),
        positionName: user.position?.positionName ?? '',
        status: user.enabledStatus ? 'ACTIVO' : 'INACTIVO',
      });

      ['email', 'firstName', 'lastName', 'identification', 'role'].forEach(
        (f) => this.userForm.get(f)?.disable()
      );

      const matched = this.availablePositionsList.find(
        (p) =>
          p.label.toUpperCase() ===
          (user.position?.positionName ?? '').toUpperCase()
      );

      if (matched) {
        this.selectedPosition = matched.value;
      } else if (user.position?.positionName) {
        this.proposedPositionName = user.position.positionName.toUpperCase();
      }

      this.isLoading = false;
    });
  }

  get raw() {
    return this.userForm.getRawValue();
  }

  get institutionalEmail(): string {
    const prefix = this.userForm.get('email')?.value || '';
    return `${prefix}@uptc.edu.co`.toLowerCase();
  }

  submitForm(): void {
    if (this.isSubmitting) return;
    this.transformValuesToUppercase();

    if (this.userForm.invalid) {
      this.showFeedback('Complete correctamente el formulario.', false);
      return;
    }
    this.showConfirmationModal = true;
  }

  confirmUpdate(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const isActive = this.userForm.get('status')?.value === 'ACTIVO';
    const selectedName = this.userForm.value.positionName!.trim().toUpperCase();
    const existing = this.availablePositionsList.find(
      (p) => p.label.toUpperCase() === selectedName
    );

    const payload: UpdateUserRequest = {
      isActive,
      ...(existing
        ? { positionId: existing.value.id }
        : { positionName: selectedName }),
    };

    this.userService.updateUser(this.userId, payload).subscribe({
      next: (updated) => {
        this.feedbackSuccess = true;
        this.feedbackMessage = '✅ Usuario actualizado exitosamente.';
        this.creationDate = updated.creationDate;
        this.modificationDate = updated.modificationStatusDate;

        setTimeout(() => {
          this.feedbackMessage = null;
          this.showConfirmationModal = false;
          this.isSubmitting = false;
          this.loadUser();
        }, 4000);
      },
      error: () => {
        this.feedbackSuccess = false;
        this.feedbackMessage = '❌ Error al actualizar usuario.';
        setTimeout(() => {
          this.feedbackMessage = null;
          this.isSubmitting = false;
        }, 4000);
      },
    });
  }

  cancelConfirmation(): void {
    this.showConfirmationModal = false;
  }

  goBack(): void {
    this.router.navigate(['/dashboard/users/search-user']);
  }

  private extractPrefix(email: string): string {
    return email.split('@')[0];
  }

  private mapRoleToSpanish(keycloakRole: string): string {
    const map: Record<string, string> = {
      'AUTHORIZED-USER': 'PERSONAL AUTORIZADO',
      'QUALITY-ADMIN-USER': 'ANALISTA DE CALIDAD',
    };
    return map[keycloakRole] ?? keycloakRole;
  }

  private transformValuesToUppercase(): void {
    ['positionName', 'status'].forEach((field) => {
      const ctl = this.userForm.get(field);
      if (ctl?.value) ctl.setValue(ctl.value.toString().toUpperCase());
    });
  }

  private showFeedback(message: string, success: boolean) {
    this.feedbackMessage = message;
    this.feedbackSuccess = success;
    setTimeout(() => (this.feedbackMessage = null), 5000);
  }

  onSelectPosition(position: { id: number; positionName: string }): void {
    this.selectedPosition = position;
    this.proposedPositionName = null;
    this.userForm.get('positionName')?.setValue(position.positionName);
  }

  onProposedPosition(name: string): void {
    this.proposedPositionName = name.trim().toUpperCase();
    this.selectedPosition = null;
    this.userForm.get('positionName')?.setValue(this.proposedPositionName);
  }

  get selectedPositionOrProposed(): PositionDto | null {
    if (this.selectedPosition) return this.selectedPosition;
    if (this.proposedPositionName)
      return { id: 0, positionName: this.proposedPositionName };
    return null;
  }
}
