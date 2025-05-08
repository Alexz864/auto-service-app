import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IstoricReceiveCar } from '../../../../core/models/istoric-service.model';

@Component({
  selector: 'app-car-receive-form',
  templateUrl: './car-receive-form.component.html',
  styleUrls: ['./car-receive-form.component.scss']
})
export class CarReceiveFormComponent implements OnInit {
  @Input() receive: IstoricReceiveCar | null = null;
  @Input() appointmentId: number | null = null;
  @Input() loading: boolean = false;
  @Output() formSubmit = new EventEmitter<IstoricReceiveCar>();

  receiveForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.receiveForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.receive) {
      this.populateForm();
    }
  }

  ngOnChanges(): void {
    if (this.receive) {
      this.populateForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      appointmentId: [null],
      visualProblems: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      clientReportedProblems: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      purpose: ['', Validators.required]
    });
  }

  populateForm(): void {
    if (this.receive) {
      this.receiveForm.patchValue({
        appointmentId: this.receive.appointmentId,
        visualProblems: this.receive.visualProblems,
        clientReportedProblems: this.receive.clientReportedProblems,
        purpose: this.receive.purpose
      });
    } else if (this.appointmentId) {
      this.receiveForm.patchValue({
        appointmentId: this.appointmentId
      });
    }
  }

  onSubmit(): void {
    if (this.receiveForm.valid) {

      if (this.appointmentId && !this.receiveForm.get('appointmentId')?.value) {
        this.receiveForm.patchValue({
          appointmentId: this.appointmentId
        });
      }

      const receiveData: IstoricReceiveCar = this.receiveForm.value;
      this.formSubmit.emit(receiveData);
    } else {

      Object.keys(this.receiveForm.controls).forEach(key => {
        const control = this.receiveForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
