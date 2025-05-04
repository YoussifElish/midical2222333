import { Component, OnInit } from '@angular/core';
import { DoctorAvailabilityService } from '../../../shared/services/doctor-availability.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctor-availability',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './doctor-availability.component.html',
  styleUrls: ['./doctor-availability.component.css']
})
export class DoctorAvailabilityComponent implements OnInit {
  availabilityForm: FormGroup;
  availabilities: any[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  availabilityToDelete: any | null = null;
  availabilityDetails: any | null = null;

  constructor(
    private fb: FormBuilder,
    private availabilityService: DoctorAvailabilityService
  ) {
    this.availabilityForm = this.fb.group({
      date: ['', Validators.required],
      from: ['', Validators.required],
      to: ['', Validators.required],
      slotDurationInMinutes: [30, [Validators.required, Validators.min(1)]],
      pricePerSlot: [0, [Validators.required, Validators.min(0)]],
      sessionMode: [1, [Validators.required]] // Default to 1 (In-Person)
    }, { validators: this.timeRangeValidator });
  }

  timeRangeValidator(form: FormGroup): { [key: string]: any } | null {
    const date = form.get('date')?.value;
    const from = form.get('from')?.value;
    const to = form.get('to')?.value;
    if (date && from && to) {
      const startTime = new Date(`${date}T${from}`);
      const endTime = new Date(`${date}T${to}`);
      if (endTime <= startTime) {
        return { invalidTimeRange: true };
      }
    }
    return null;
  }

  ngOnInit(): void {
    this.loadAvailabilities();
  }

  loadAvailabilities(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.availabilityService.getAllDoctorAvailabilities().subscribe({
      next: (data: any[]) => {
        this.availabilities = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching availabilities:', err);
        this.errorMessage = 'Failed to load availabilities. Please try again.';
        if (err.status === 401) {
          this.errorMessage = 'Unauthorized. Please log in again.';
        }
        this.isLoading = false;
      }
    });
  }

  addAvailability(): void {
    if (this.availabilityForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.availabilityForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const formValue = this.availabilityForm.value;

    const startTime = new Date(`${formValue.date}T${formValue.from}`);
    const endTime = new Date(`${formValue.date}T${formValue.to}`);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      this.errorMessage = 'Invalid date or time format.';
      this.isLoading = false;
      return;
    }

    if (endTime <= startTime) {
      this.errorMessage = 'End time must be after start time.';
      this.isLoading = false;
      return;
    }

    const payload = {
      date: new Date(formValue.date).toISOString().split('T')[0], // e.g., "2025-05-04"
      from: formValue.from, // e.g., "14:00"
      to: formValue.to, // e.g., "16:00"
      slotDurationInMinutes: formValue.slotDurationInMinutes,
      pricePerSlot: formValue.pricePerSlot,
      sessionMode: parseInt(formValue.sessionMode, 10) // Ensure sessionMode is an integer (1 or 2)
    };

    this.availabilityService.addDoctorAvailability(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.availabilityForm.reset({
          date: '',
          from: '',
          to: '',
          slotDurationInMinutes: 30,
          pricePerSlot: 0,
          sessionMode: 1 // Reset to In-Person
        });
        this.loadAvailabilities();
      },
      error: (err: any) => {
        console.error('Error adding availability:', err);
        this.errorMessage = err.error?.errors?.To?.[0] || 'Failed to add availability. Please check the details and try again.';
        if (err.status === 401) {
          this.errorMessage = 'Unauthorized. Please log in again.';
        }
        this.isLoading = false;
      }
    });
  }

  prepareRemoveAvailability(slot: any): void {
    this.availabilityToDelete = slot;
    this.confirmRemoveAvailability();
  }

  confirmRemoveAvailability(): void {
    if (!this.availabilityToDelete) return;

    if (!confirm(`Are you sure you want to remove the availability on ${this.formatDate(this.availabilityToDelete.date)} from ${this.availabilityToDelete.from} to ${this.availabilityToDelete.to}?`)) {
      this.availabilityToDelete = null;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const idToDelete = this.availabilityToDelete.id;
    this.availabilityToDelete = null;

    this.availabilityService.removeDoctorAvailability(idToDelete).subscribe({
      next: () => {
        this.isLoading = false;
        this.loadAvailabilities();
      },
      error: (err: any) => {
        console.error('Error removing availability:', err);
        this.errorMessage = 'Failed to remove availability. Please try again.';
        if (err.status === 401) {
          this.errorMessage = 'Unauthorized. Please log in again.';
        }
        this.isLoading = false;
      }
    });
  }

  showDetails(slot: any): void {
    this.availabilityDetails = slot;
  }

  closeDetailsModal(): void {
    this.availabilityDetails = null;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString([], { dateStyle: 'short' });
    } catch (e) {
      return dateString;
    }
  }
}