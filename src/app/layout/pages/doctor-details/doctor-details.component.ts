import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, Doctor } from '../../../shared/services/admin';

@Component({
  selector: 'app-doctor-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-details.component.html',
  styleUrls: ['./doctor-details.component.css']
})
export class DoctorDetailsComponent implements OnInit {
  doctor: Doctor | null = null;
  loading = true;
  error: string | null = null;
  doctorId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.doctorId = params['id'];
      if (this.doctorId) {
        this.loadDoctorDetails();
      }
    });
  }

  loadDoctorDetails(): void {
    this.loading = true;
    this.adminService.getDoctorById(this.doctorId).subscribe({
      next: (doctor) => {
        this.doctor = doctor;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load doctor details';
        this.loading = false;
        console.error('Error loading doctor details:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/doctors']);
  }
}

