import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Client } from '../../../../core/models/client.model';

@Component({
  selector: 'app-form-client',
  templateUrl: './form-client.component.html',
  styleUrls: ['./form-client.component.scss']
})
export class FormClientComponent implements OnInit {
  @Input() client: Client | null = null;
  @Input() loading: boolean = false;
  @Output() formSubmit = new EventEmitter<Client>();

  clientForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.clientForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.client) {
      this.populateForm();
    }
  }

  ngOnChanges(): void {
    if (this.client) {
      this.populateForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      last_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      first_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: this.fb.array([
        this.fb.control('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)])
      ]),
      activ: [true]
    });
  }

  populateForm(): void {
    this.clientForm.patchValue({
      last_name: this.client?.last_name,
      first_name: this.client?.first_name,
      email: this.client?.email,
      activ: Boolean(this.client?.activ)
    });

    while (this.phoneArray.length) {
      this.phoneArray.removeAt(0);
    }

    if (this.client?.phone) {
      this.phoneArray.push(
        this.fb.control(this.client.phone, [Validators.required, Validators.pattern(/^[0-9]{10}$/)])
      );
    } else {

      this.phoneArray.push(
        this.fb.control('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)])
      );
    }
  }

  get phoneArray(): FormArray {
    return this.clientForm.get('phone') as FormArray;
  }

  addTelefon(): void {
    this.phoneArray.push(this.fb.control('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]));
  }

  removePhone(index: number): void {
    if (this.phoneArray.length > 1) {
      this.phoneArray.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      const formValue = this.clientForm.value;

      const clientData: Client = {
        last_name: formValue.last_name,
        first_name: formValue.first_name,
        email: formValue.email,
        phone: formValue.phone[0],
        activ: Boolean(formValue.activ)
      };

      this.formSubmit.emit(clientData);
    } else {

      Object.keys(this.clientForm.controls).forEach(key => {
        const control = this.clientForm.get(key);
        control?.markAsTouched();
      });

      this.phoneArray.controls.forEach(control => {
        control.markAsTouched();
      });
    }
  }
}
