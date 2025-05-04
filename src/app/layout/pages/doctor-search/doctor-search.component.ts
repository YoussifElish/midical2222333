import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../shared/services/appointment.service'; // Adjust path as needed

@Component({
  selector: 'app-doctor-search',
  standalone: true,
  imports: [CommonModule], // Import CommonModule for *ngFor, etc.
  templateUrl: './doctor-search.component.html',
  styleUrls: ['./doctor-search.component.css']
})
export class DoctorSearchComponent implements OnInit {

  doctors: any[] = []; // Use a more specific type if available
  isLoading = true;
  error: string | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.error = null;
    this.appointmentService.getDoctorsWithAppointments().subscribe({
      next: (response) => {
        // Assuming the API returns an array of doctors directly or within a property
        // Adjust based on the actual API response structure
        this.doctors = response.data || response; // Example: Adjust if data is nested
        this.isLoading = false;
        console.log('Doctors loaded:', this.doctors);
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
        this.error = 'Failed to load doctors. Please try again later.';
        // Attempting to log more details about the error
        if (err.error instanceof ErrorEvent) {
          // Client-side or network error
          this.error += ` Details: ${err.error.message}`;
        } else {
          // Backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong.
          this.error += ` Status: ${err.status}, Body: ${JSON.stringify(err.error)}`;
        }
        this.isLoading = false;
      }
    });
  }

  viewDoctorAppointments(doctorId: number): void {
    // Navigate to the doctor-specific appointments page, passing the doctorId
    // Ensure the route '/doctor-appointments/:id' is defined in app.routes.ts
    this.router.navigate(['/patient-appointment', doctorId]);
  }
}

