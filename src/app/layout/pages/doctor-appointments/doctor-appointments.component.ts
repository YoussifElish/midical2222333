import { Component, OnInit } from '@angular/core';
import { DoctorAppointmentsService } from '../../../shared/services/doctor-appointments.service';
import { CommonModule } from '@angular/common';

interface Patient {
  id: string; // Assuming patient ID is a string like Guid
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
  dob: string | null; // Date of Birth
  // Add other relevant patient properties if available
}

interface Doctor {
  id: number;
  user: any | null;
  userId: string;
  specialization: string;
  bio: string;
  yearsOfExperience: number;
  isActive: boolean;
  accountStatus: number;
  rating: number;
  totalReviews: number;
  profileImageId: string;
  profileImage: any | null;
  certificationDocumentId: string;
  certificationDocument: any | null;
}

interface Appointment {
  id: number;
  appointmentType: number; // 1 = In-Person, 2 = Online
  doctorId: number;
  doctor: Doctor;
  patientId: string; // Added patient ID
  patient: Patient | null; // Added patient details object
  appointmentDate: string; // e.g., "2025-05-05T03:30:00"
  status: number; // e.g., 4 = Scheduled
  statusChangedAt: string | null;
  durationInMinutes: number;
  pricePerSlot: number;
  doctorAvailability: any | null;
  doctorAvailabilityId: number;
}

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-appointments.component.html',
  styleUrls: ['./doctor-appointments.component.css']
})
export class DoctorAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  appointmentDetails: Appointment | null = null;

  constructor(private appointmentsService: DoctorAppointmentsService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.appointmentsService.getAllDoctorAppointments().subscribe({
      next: (data: Appointment[]) => {
        this.appointments = data;
        this.isLoading = false;
        console.log('Appointments loaded:', data); // Debug log
      },
      error: (err) => {
        console.error('Error loading appointments:', err);
        this.errorMessage = err.error?.message || 'Failed to load appointments. Please try again later.';
        if (err.status === 401) {
          this.errorMessage = 'Unauthorized. Please log in again.';
        }
        this.isLoading = false;
      }
    });
  }

  prepareDeleteAppointment(appointment: Appointment): void {
    if (confirm(`Are you sure you want to delete appointment ID ${appointment.id} on ${this.formatDate(appointment.appointmentDate)}?`)) {
      this.deleteAppointment(appointment.id);
    }
  }

  deleteAppointment(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.appointmentsService.deleteDoctorAppointment(id).subscribe({
      next: () => {
        console.log(`Appointment ${id} deleted successfully.`);
        this.isLoading = false;
        this.loadAppointments();
      },
      error: (err) => {
        console.error(`Error deleting appointment ${id}:`, err);
        this.errorMessage = err.error?.message || `Failed to delete appointment ${id}. Please try again.`;
        this.isLoading = false;
      }
    });
  }

  showDetails(appointment: Appointment): void {
    this.appointmentDetails = appointment;
  }

  closeDetailsModal(): void {
    this.appointmentDetails = null;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch (e) {
      console.warn(`Could not format date: ${dateString}`, e);
      return dateString;
    }
  }

  formatAppointmentType(appointmentType: number): string {
    if (appointmentType === 1) return 'In-Person';
    if (appointmentType === 2) return 'Online';
    return 'Unknown';
  }

  formatStatus(status: number): string {
    const statusMap: { [key: number]: string } = {
      4: 'Scheduled',
      // Add other status mappings based on API documentation
      0: 'Pending',
      1: 'Confirmed',
      2: 'Completed',
      3: 'Cancelled'
    };
    return statusMap[status] || 'Unknown';
  }

  getStatusBadgeClass(status: number): string {
    const statusClassMap: { [key: number]: string } = {
      4: 'bg-info-subtle text-info-emphasis',       // Scheduled
      0: 'bg-warning-subtle text-warning-emphasis', // Pending
      1: 'bg-primary-subtle text-primary-emphasis', // Confirmed
      2: 'bg-success-subtle text-success-emphasis', // Completed
      3: 'bg-danger-subtle text-danger-emphasis'    // Cancelled
    };
    return statusClassMap[status] || 'bg-secondary-subtle text-secondary-emphasis'; // Unknown/Default
  }
}

