import { Component, OnInit } from '@angular/core';
import { AdminService, Doctor } from '../../../shared/services/admin';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-doctors.html',
  styleUrls: ['./admin-doctors.css']
})
export class AdminDoctorsComponent implements OnInit {
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  selectedSpecialization = '';
  selectedStatus = '';

  specializations: string[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDoctors();
  }
loadDoctors(): void {
  this.loading = true;
  this.adminService.getDoctors().subscribe({
    next: (res: any) => {
      console.log('Doctors response:', res);
      if (!res || !Array.isArray(res.items)) {
        this.error = 'Unexpected response format (missing items array)';
        console.error('Unexpected doctors response:', res);
        this.loading = false;
        return;
      }

      // Map API response to Doctor interface
      this.doctors = res.items.map((item: any) => ({
        id: item.userId,
        firstName: item.doctorName.split(' ')[0] || '', // Extract first name
        lastName: item.doctorName.split(' ').slice(1).join(' ') || '', // Extract last name
        email: '', // Not provided by API, set to empty or handle in template
        phoneNumber: '', // Not provided by API, set to empty or handle in template
        specialization: item.specialization || 'General Practice',
        status: item.status === 1 ? 'approved' : 'pending', // Map status to string
        isApproved: item.status === 1 // Convert status to boolean
      }));

      this.filteredDoctors = this.doctors;
      this.extractSpecializations();
      this.loading = false;
    },
    error: (error) => {
      this.error = 'Failed to load doctors';
      this.loading = false;
      console.error('Error loading doctors:', error);
    }
  });
}
approveDoctor(doctorId: string): void {
  this.adminService.updateDoctorStatus(doctorId, 'approved').subscribe({
    next: () => {
      this.refreshDoctors(); // Reload doctors after approval
    },
    error: (error) => {
      console.error('Error approving doctor:', error);
      this.error = 'Failed to approve doctor';
    }
  });
}
  extractSpecializations(): void {
    const specs = [...new Set(this.doctors.map(doctor => doctor.specialization))];
    this.specializations = specs.filter(spec => spec);
  }

  filterDoctors(): void {
    this.filteredDoctors = this.doctors.filter(doctor => {
      const matchesSearch = !this.searchTerm || 
        doctor.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doctor.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doctor.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesSpecialization = !this.selectedSpecialization || 
        doctor.specialization === this.selectedSpecialization;
      
      const matchesStatus = !this.selectedStatus || 
        (this.selectedStatus === 'approved' && doctor.isApproved) ||
        (this.selectedStatus === 'pending' && !doctor.isApproved);

      return matchesSearch && matchesSpecialization && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.filterDoctors();
  }

  onSpecializationChange(): void {
    this.filterDoctors();
  }

  onStatusChange(): void {
    this.filterDoctors();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedSpecialization = '';
    this.selectedStatus = '';
    this.filteredDoctors = this.doctors;
  }

  refreshDoctors(): void {
    this.error = null;
    this.loadDoctors();
  }
}

