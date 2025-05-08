import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../shared/services/appointment.service';

// Define the Doctor interface inside this file
interface Doctor {
  id: number;
  doctorName: string;
  specialization?: string;
  yearsOfExperience?: number;
  rating?: number;
  totalReviews?: number;
  bio?: string;
  profileImagePath?: string;
  userId?: string;
}

@Component({
  selector: 'app-doctor-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-search.component.html',
  styleUrls: ['./doctor-search.component.css'],
})
export class DoctorSearchComponent implements OnInit {
  doctors: Doctor[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.error = null;
    this.appointmentService.getDoctorsWithAppointments().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.isLoading = false;
        console.log('Doctors loaded:', this.doctors);
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
        this.error = 'Failed to load doctors. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  viewDoctorAppointments(doctorId: number, doctorName: string): void {
    console.log('Navigating to:', { doctorId, doctorName });
    localStorage.setItem('doctorName', doctorName); // Persist for refresh
    this.router.navigate(['/patient-appointment', doctorId]);
  }
}