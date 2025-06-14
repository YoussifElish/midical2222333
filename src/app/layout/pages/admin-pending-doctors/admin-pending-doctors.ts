import { Component, OnInit } from '@angular/core';
import { AdminService, Doctor } from '../../../shared/services/admin';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-pending-doctors',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-pending-doctors.html',
  styleUrls: ['./admin-pending-doctors.css']
})
export class AdminPendingDoctorsComponent implements OnInit {
  pendingDoctors: Doctor[] = [];
  loading = true;
  error: string | null = null;
  processingDoctorId: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPendingDoctors();
  }

loadPendingDoctors(): void {
  this.loading = true;
  this.adminService.getPendingDoctors().subscribe({
    next: (res: any) => {
      console.log('Pending doctors response:', res);
      if (!res || !Array.isArray(res.items)) {
        this.error = 'Unexpected response format (missing items array)';
        console.error('Unexpected pending doctors response:', res);
        this.loading = false;
        return;
      }

      // Map API response to Doctor interface
      this.pendingDoctors = res.items.map((item: any) => ({
        id: item.userId,
        firstName: item.doctorName.split(' ')[0] || '',
        lastName: item.doctorName.split(' ').slice(1).join(' ') || '',
        email: '', // Not provided by API
        phoneNumber: '', // Not provided by API
        specialization: item.specialization || 'General Practice',
        status: item.status === 0 ? 'pending' : 'unknown', // All should be pending
        isApproved: false // Pending doctors have status 0
      }));

      this.loading = false;
    },
    error: (error) => {
      this.error = 'Failed to load pending doctors';
      this.loading = false;
      console.error('Error loading pending doctors:', error);
    }
  });
}
  approveDoctor(doctorId: string): void {
    this.processingDoctorId = doctorId;
    this.adminService.updateDoctorStatus(doctorId, 'approved').subscribe({
      next: () => {
        this.pendingDoctors = this.pendingDoctors.filter(d => d.id !== doctorId);
        this.processingDoctorId = null;
      },
      error: (error) => {
        this.error = 'Failed to approve doctor';
        this.processingDoctorId = null;
        console.error('Error approving doctor:', error);
      }
    });
  }

  rejectDoctor(doctorId: string): void {
    this.processingDoctorId = doctorId;
    this.adminService.updateDoctorStatus(doctorId, 'rejected').subscribe({
      next: () => {
        this.pendingDoctors = this.pendingDoctors.filter(d => d.id !== doctorId);
        this.processingDoctorId = null;
      },
      error: (error) => {
        this.error = 'Failed to reject doctor';
        this.processingDoctorId = null;
        console.error('Error rejecting doctor:', error);
      }
    });
  }

  refreshPendingDoctors(): void {
    this.error = null;
    this.loadPendingDoctors();
  }
}

