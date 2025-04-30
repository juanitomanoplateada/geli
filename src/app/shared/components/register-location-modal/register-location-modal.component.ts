import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-register-location-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register-location-modal.component.html',
  styleUrls: ['./register-location-modal.component.scss'],
})
export class RegisterLocationModalComponent {
  @Input() initialName: string = '';
  @Output() locationCreated = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form = this.fb.group({
    locationName: ['', Validators.required],
    locationType: ['', Validators.required],
    parentLocation: [''], // opcional
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form.patchValue({ locationName: this.initialName });
  }

  submit() {
    if (this.form.valid) {
      this.locationCreated.emit(this.form.value);
    }
  }

  cancelModal() {
    this.cancel.emit();
  }
}
