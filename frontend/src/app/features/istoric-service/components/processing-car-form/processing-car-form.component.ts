import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { IstoricProcessingCar } from '../../../../core/models/istoric-service.model';
import { Part } from '../../../../core/models/part.model';
import { PartService } from '../../../../core/services/part.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-processing-car-form',
  templateUrl: './processing-car-form.component.html',
  styleUrls: ['./processing-car-form.component.scss']
})
export class ProcessingCarFormComponent implements OnInit {
  @Input() processing: IstoricProcessingCar | null = null;
  @Input() appointmentId: number | null = null;
  @Input() loading: boolean = false;
  @Output() formSubmit = new EventEmitter<IstoricProcessingCar>();

  processingForm: FormGroup;
  parts: Part[] = [];
  loadingParts: boolean = false;

  constructor(
    private fb: FormBuilder,
    private partService: PartService,
    private notificationService: NotificationService
  ) {
    this.processingForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadParts();

    if (this.processing) {
      this.populateForm();
    }
  }

  ngOnChanges(): void {
    if (this.processing) {
      this.populateForm();
    }
  }

  loadParts(): void {
    this.loadingParts = true;

    this.partService.getAll({ activ: true }).subscribe({
      next: (data) => {
        this.parts = data;
        this.loadingParts = false;
      },
      error: (error) => {
        this.notificationService.showError('Eroare la încărcarea pieselor: ' + error.message);
        this.loadingParts = false;
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      appointmentId: [null],
      operationsDone: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      usedParts: this.fb.array([]),
      foundProblems: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      solvedProblems: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      serviceTime: [0, [Validators.required, Validators.min(0), Validators.max(1440)]]
    });
  }

  populateForm(): void {
    if (this.processing) {
      this.processingForm.patchValue({
        appointmentId: this.processing.appointmentId,
        operationsDone: this.processing.operationsDone,
        foundProblems: this.processing.foundProblems,
        solvedProblems: this.processing.solvedProblems,
        serviceTime: this.processing.serviceTime
      });

      while (this.usedPartsArray.length) {
        this.usedPartsArray.removeAt(0);
      }

      if (this.processing.usedParts && this.processing.usedParts.length > 0) {
        this.processing.usedParts.forEach(part => {
          this.usedPartsArray.push(this.fb.group({
            partId: [part.partId, Validators.required],
            quantity: [part.quantity, [Validators.required, Validators.min(1)]]
          }));
        });
      }
      else if (this.processing.Parts && this.processing.Parts.length > 0) {
        this.processing.Parts.forEach(part => {
          this.usedPartsArray.push(this.fb.group({
            partId: [part.id, Validators.required],
            quantity: [part.UsedPart.quantity, [Validators.required, Validators.min(1)]]
          }));
        });
      }
    } else if (this.appointmentId) {
      this.processingForm.patchValue({
        appointmentId: this.appointmentId
      });
    }
  }

  get usedPartsArray(): FormArray {
    return this.processingForm.get('usedParts') as FormArray;
  }

  addPart(): void {
    this.usedPartsArray.push(this.fb.group({
      partId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    }));
  }

  removePart(index: number): void {
    this.usedPartsArray.removeAt(index);
  }

  getPartName(partId: number): string {
    const part = this.parts.find(p => p.id === partId);
    return part ? part.name : '';
  }

  onSubmit(): void {
    if (this.processingForm.valid) {
      const processingData: IstoricProcessingCar = this.processingForm.value;
      this.formSubmit.emit(processingData);
    } else {
      Object.keys(this.processingForm.controls).forEach(key => {
        const control = this.processingForm.get(key);
        control?.markAsTouched();
      });

      this.usedPartsArray.controls.forEach(control => {

      if (control instanceof FormGroup || control instanceof FormArray) {
        Object.keys(control.controls).forEach(key => {
          const childControl = control.get(key);
          if (childControl) {
            childControl.markAsTouched();
          }
        });
      }
      });
    }
  }
}
