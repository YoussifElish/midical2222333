import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  profileImage?: string;
  userType: 'doctor' | 'patient';
  specialization?: string; // For doctors
  bio?: string; // For doctors
  yearsOfExperience?: number; // For doctors
  emergencyContact?: string; // For patients
  bloodType?: string; // For patients
}

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css']
})
export class ProfileViewComponent implements OnInit {
  userId: string = '';
  userType: 'doctor' | 'patient' = 'patient';
  profile: UserProfile | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      this.userType = params['type'] || 'patient';
      if (this.userId) {
        this.loadProfile();
      }
    });
  }

  loadProfile(): void {
    this.loading = true;
    
    // Simulate API call - replace with actual service call
    setTimeout(() => {
      if (this.userType === 'doctor') {
        this.profile = {
          id: this.userId,
          firstName: 'Ahmed',
          lastName: 'Hassan',
          email: 'ahmed.hassan@example.com',
          phoneNumber: '+20 123 456 7890',
          dateOfBirth: '1985-03-15',
          gender: 'Male',
          address: '123 Medical Street, Cairo, Egypt',
          userType: 'doctor',
          specialization: 'Cardiology',
          bio: 'Experienced cardiologist with over 15 years of practice. Specialized in interventional cardiology and heart disease prevention.',
          yearsOfExperience: 15
        };
      } else {
        this.profile = {
          id: this.userId,
          firstName: 'Sarah',
          lastName: 'Mohamed',
          email: 'sarah.mohamed@example.com',
          phoneNumber: '+20 987 654 3210',
          dateOfBirth: '1990-07-22',
          gender: 'Female',
          address: '456 Patient Avenue, Alexandria, Egypt',
          userType: 'patient',
          emergencyContact: '+20 111 222 3333',
          bloodType: 'A+'
        };
      }
      this.loading = false;
    }, 1000);
  }

  goBack(): void {
    if (this.userType === 'doctor') {
      this.router.navigate(['/admin/doctors']);
    } else {
      this.router.navigate(['/admin/patients']);
    }
  }

  calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

