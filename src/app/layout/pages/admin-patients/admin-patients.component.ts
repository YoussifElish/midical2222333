import { Component, OnInit } from '@angular/core';
import { AdminService, Patient } from '../../../shared/services/admin';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-patients',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-patients.component.html',
  styleUrls: ['./admin-patients.component.css']
})
export class AdminPatientsComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPatients();
  }
loadPatients(): void {
  this.loading = true;
  this.adminService.getPatients().subscribe({
    next: (res: any) => {
      console.log('Patients response:', res);
      if (!res || !Array.isArray(res.items)) {
        this.error = 'Unexpected response format (missing items array)';
        console.error('Unexpected patients response:', res);
        this.loading = false;
        return;
      }

      // Map API response to Patient interface
      this.patients = res.items.map((item: any) => ({
        id: item.userId || item.id || '', // Handle userId or id
        firstName: item.patientName ? item.patientName.split(' ')[0] || '' : item.firstName || '',
        lastName: item.patientName ? item.patientName.split(' ').slice(1).join(' ') || '' : item.lastName || '',
        email: item.email || 'N/A', // Default to 'N/A' if missing
        phoneNumber: item.phoneNumber || 'N/A' // Default to 'N/A' if missing
      }));

      this.filteredPatients = this.patients;
      this.loading = false;
    },
    error: (error) => {
      this.error = 'Failed to load patients';
      this.loading = false;
      console.error('Error loading patients:', error);
    }
  });
}
  filterPatients(): void {
    this.filteredPatients = this.patients.filter(patient => {
      const matchesSearch = !this.searchTerm || 
        patient.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesSearch;
    });
  }

  onSearchChange(): void {
    this.filterPatients();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filteredPatients = this.patients;
  }

  refreshPatients(): void {
    this.error = null;
    this.loadPatients();
  }
}

