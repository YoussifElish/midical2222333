import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {  CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import  AOS from 'aos';
import { SliderComponent } from '../../additions/slider/slider.component';
import { AppointmentService } from '../../../shared/services/appointment.service';
import { CommonModule } from '@angular/common';
 
  
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
  selector: 'app-home',
  standalone: true,
  imports: [CarouselModule,RouterLink,SliderComponent,CommonModule,], 
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
 })

export class HomeComponent implements OnInit {
 
doctors: Doctor[] = [];
  isLoading = true;
  error: string | null = null;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
    0: { items: 1 },
    400: { items: 2 },
    900: { items: 3 }
    },
    nav: true,
    };

  constructor(private renderer: Renderer2,private appointmentService:AppointmentService,private router:Router) {}


  ngOnInit(): void {
        this.loadDoctors();
    if (typeof window !== 'undefined') {
      AOS.init({
        duration: 2000,
      });
    }
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
