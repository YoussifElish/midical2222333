import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppointmentService } from '../../../shared/services/appointment.service'; // Adjust path as needed
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-patient-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule here
  templateUrl: './patient-appointment.component.html',
  styleUrls: ['./patient-appointment.component.css']
})
export class patientAppointmentsComponent implements OnInit, OnDestroy {

  doctorId: number | null = null;
  appointments: any[] = []; // Use a more specific type if available
  isLoading = true;
  error: string | null = null;
  bookingError: string | null = null;
  isBooking = false;
  selectedAppointmentId: number | null = null;
  notes: string = ''; // Optional notes for booking

  private routeSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router, // Keep router private
    private appointmentService: AppointmentService
  ) { }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.doctorId = +id; // Convert string id to number
        this.loadAppointments();
      } else {
        this.error = 'Doctor ID not found in route.';
        this.isLoading = false;
        console.error('Doctor ID missing from route parameters.');
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  // Public method to handle navigation
  goBack(): void {
    this.router.navigate(['/doctors']);
  }

  loadAppointments(): void {
    if (!this.doctorId) return;
  
    this.isLoading = true;
    this.error = null;
  
    this.appointmentService.getActiveAppointmentsByDoctorId(this.doctorId).subscribe({
      next: (response) => {
        const rawAppointments = response.data || response;
  
        // 🛠️ احسب startTime و endTime لكل موعد
        this.appointments = rawAppointments.map((appt: any) => {
          const start = new Date(appt.appointmentDate);
          const end = new Date(start.getTime() + appt.durationInMinutes * 60000);
          return {
            ...appt,
            startTime: start,
            endTime: end
          };
        });
  
        this.isLoading = false;
        console.log(`Appointments for doctor ${this.doctorId}:`, this.appointments);
  
        if (this.appointments.length === 0) {
          this.error = 'No available appointments found for this doctor.';
        }
      },
      error: (err) => {
        console.error(`Error loading appointments for doctor ${this.doctorId}:`, err);
        this.error = 'Failed to load appointments. Please try again later.';
        if (err.error instanceof ErrorEvent) {
          this.error += ` Details: ${err.error.message}`;
        } else {
          this.error += ` Status: ${err.status}, Body: ${JSON.stringify(err.error)}`;
        }
        this.isLoading = false;
      }
    });
  }
  

  selectAppointment(appointmentId: number): void {
    this.selectedAppointmentId = appointmentId;
    this.bookingError = null; // Clear previous booking errors
    console.log('Selected appointment ID:', this.selectedAppointmentId);
  }

  proceedToPayment(): void {
    if (!this.selectedAppointmentId) {
      this.bookingError = 'Please select an appointment time slot first.';
      return;
    }
  
    this.isBooking = true;
    this.bookingError = null;
  
    this.appointmentService.bookAppointment(this.selectedAppointmentId, this.notes).subscribe({
      next: (response) => {
        console.log('Booking successful:', response);
        // Assuming the response contains a payment link, now looking for paymentUrl instead of paymentLink
        const paymentUrl = response.paymentUrl || response.data?.paymentUrl;
        if (paymentUrl) {
          // Redirect the user to the payment link
          window.location.href = paymentUrl;
        } else {
          console.error('Payment link not found in booking response:', response);
          this.bookingError = 'Booking confirmed..., but failed to retrieve payment link. Please contact support.';
          this.isBooking = false;
        }
      },
      error: (err) => {
        console.error('Error booking appointment:', err);
        this.bookingError = 'Failed to book appointment. Please try again.';
        if (err.error instanceof ErrorEvent) {
          this.bookingError += ` Details: ${err.error.message}`;
        } else {
          this.bookingError += ` Status: ${err.status}, Body: ${JSON.stringify(err.error)}`;
        }
        this.isBooking = false;
      }
    });
  }
  
}
