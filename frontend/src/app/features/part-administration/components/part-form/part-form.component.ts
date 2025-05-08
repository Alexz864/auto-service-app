import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Part } from '../../../../core/models/part.model';

@Component({
  selector: 'app-part-form',
  templateUrl: './part-form.component.html',
  styleUrls: ['./part-form.component.scss']
})
export class PartFormComponent implements OnInit {
  @Input() part: Part | null = null;
  @Input() loading: boolean = false;
  @Output() formSubmit = new EventEmitter<Part>();

  partForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.partForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.part) {
      this.populateForm();
    }
  }

  ngOnChanges(): void {
    if (this.part) {
      this.populateForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      activa: [true]
    });
  }

  populateForm(): void {
    if (this.part) {
      this.partForm.patchValue({
        name: this.part.name,
        code: this.part.code,
        description: this.part.description,
        price: this.part.price,
        stock: this.part.stock,
        activa: this.part.activa
      });
    }
  }

  onSubmit(): void {
    if (this.partForm.valid) {
      const partData: Part = this.partForm.value;
      this.formSubmit.emit(partData);
    } else {
      Object.keys(this.partForm.controls).forEach(key => {
        const control = this.partForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
