import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-absence',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './absence.component.html',
  styleUrl: './absence.component.css'
})
export class AbsenceComponent implements OnInit {
  leaveForm: FormGroup;
  totalDays: number = 0;

  constructor(private fb: FormBuilder) {
    this.leaveForm = this.fb.group({
      driverID: ['', Validators.required],
      name: ['', Validators.required],
      phone: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Subscribe to date changes to calculate total days
    this.leaveForm.get('startDate')?.valueChanges.subscribe(() => {
      this.calculateDays();
    });

    this.leaveForm.get('endDate')?.valueChanges.subscribe(() => {
      this.calculateDays();
    });
  }

  calculateDays() {
    const startDate = this.leaveForm.get('startDate')?.value;
    const endDate = this.leaveForm.get('endDate')?.value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Calculate the difference in days
      const diffTime = Math.abs(end.getTime() - start.getTime());
      this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    }
  }

  onSubmit() {
    if (this.leaveForm.valid) {
      console.log('Form submitted:', this.leaveForm.value);
      // Add your submit logic here
    }
  }

}
