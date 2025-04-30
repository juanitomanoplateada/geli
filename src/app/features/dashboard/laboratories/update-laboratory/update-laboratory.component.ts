import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { DropdownSearchAddableComponent } from '../../../../shared/components/dropdown-search-addable/dropdown-search-addable.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { UppercaseDirective } from '../../../../shared/directives/uppercase/uppercase.directive';
import { LaboratoryService } from '../../../../core/laboratory/services/laboratory.service';

@Component({
  selector: 'app-update-laboratory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UppercaseDirective,
    DropdownSearchAddableComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './update-laboratory.component.html',
  styleUrls: ['./update-laboratory.component.scss'],
})
export class UpdateLaboratoryComponent implements OnInit {
  labForm: FormGroup;
  availableLocations: string[] = [];
  selectedLocation: string | null = null;
  showConfirmationModal = false;
  notesRequired = false;
  labId: number = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private labService: LaboratoryService
  ) {
    this.labForm = this.fb.group({
      labName: [{ value: '', disabled: true }],
      description: ['', Validators.required],
      locationName: ['', Validators.required],
      status: ['', Validators.required],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.labId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadLaboratoryData();
  }

  loadLaboratoryData(): void {
    /*this.labService.getById(this.labId).subscribe((lab) => {
      this.labForm.patchValue({
        labName: lab.labName,
        description: lab.description,
        locationName: lab.locationName,
        status: lab.status,
        notes: lab.notes,
      });
      this.selectedLocation = lab.locationName;
      this.notesRequired = lab.status === 'INACTIVO';
      this.loadAvailableLocations();
    });*/
  }

  loadAvailableLocations(): void {
    /*this.labService.getAvailableLocations().subscribe((list: string[]) => {
      this.availableLocations = list;
      if (!this.availableLocations.includes(this.selectedLocation!)) {
        this.availableLocations.push(this.selectedLocation!);
      }
    });*/
  }

  onSelectLocation(option: string): void {
    this.selectedLocation = option;
    this.labForm.get('locationName')?.setValue(option);
  }

  onStatusChange(): void {
    const status = this.labForm.get('status')?.value;
    this.notesRequired = status === 'INACTIVO';

    const notesControl = this.labForm.get('notes');
    if (this.notesRequired) {
      notesControl?.setValidators([Validators.required]);
    } else {
      notesControl?.clearValidators();
    }
    notesControl?.updateValueAndValidity();
  }

  autoResize(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  submitForm(): void {
    if (this.labForm.valid) {
      this.showConfirmationModal = true;
    }
  }

  confirmUpdate(): void {
    /*const updatePayload = {
      id: this.labId,
      description: this.labForm.value.description,
      locationName: this.labForm.value.locationName,
      status: this.labForm.value.status,
      notes: this.labForm.value.notes,
    };

    this.labService
      .updateLaboratory(this.labId, updatePayload)
      .subscribe(() => {
        this.resetForm();
        this.showConfirmationModal = false;
      });*/
  }

  cancelConfirmation(): void {
    this.showConfirmationModal = false;
  }

  resetForm(): void {
    this.labForm.reset({ status: '', notes: '' });
    this.selectedLocation = null;
    this.notesRequired = false;
  }
}
