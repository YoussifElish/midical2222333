import { Component, OnInit } from '@angular/core';
import { AdminService, Appointment } from '../../../shared/services/admin';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-appointments.component.html',
  styleUrls: ['./admin-appointments.component.css']
})
export class AdminAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  selectedStatus = '';

  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'pending', label: 'Pending' }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

loadAppointments(): void {
  this.loading = true;
  this.adminService.getAppointments().subscribe({
    next: (res: any) => {
      console.log('Appointments response:', res);
      if (!res || !Array.isArray(res.items)) {
        this.error = 'Unexpected response format (missing items array)';
        console.error('Unexpected appointments response:', res);
        this.loading = false;
        return;
      }

      // Map API response to Appointment interface
      this.appointments = res.items.map((item: any) => ({
        id: item.appointmentId || item.id || '', // Handle appointmentId or id
        patientName: item.patientName || 'Unknown Patient',
        doctorName: item.doctorName || 'Unknown Doctor',
        appointmentDateTime: item.appointmentDateTime || '',
        status: item.status || 'pending' // Default to 'pending' if missing
      }));

      this.filteredAppointments = this.appointments;
      this.loading = false;
    },
    error: (error) => {
      this.error = 'Failed to load appointments';
      this.loading = false;
      console.error('Error loading appointments:', error);
    }
  });
}
  filterAppointments(): void {
    this.filteredAppointments = this.appointments.filter(appointment => {
      const matchesSearch = !this.searchTerm || 
        appointment.patientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        appointment.doctorName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || 
        appointment.status.toLowerCase() === this.selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.filterAppointments();
  }

  onStatusChange(): void {
    this.filterAppointments();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.filteredAppointments = this.appointments;
  }

  refreshAppointments(): void {
    this.error = null;
    this.loadAppointments();
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'scheduled';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      case 'pending':
        return 'pending';
      default:
        return 'pending';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'fa-calendar-check';
      case 'completed':
        return 'fa-check-circle';
      case 'cancelled':
        return 'fa-times-circle';
      case 'pending':
        return 'fa-clock';
      default:
        return 'fa-clock';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

