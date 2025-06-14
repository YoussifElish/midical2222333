import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalDoctors: number;
  pendingDoctors: number;
  totalPatients: number;
  totalAppointments: number;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  status: string;
  isApproved: boolean;
  doctorCertificate: string; // Add certificate image URL
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  appointmentDateTime: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'https://curefusion2.runasp.net/api/Admin';

  constructor(private http: HttpClient) { }

  // Get dashboard statistics
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard-stats`);
  }

  // Get all doctors
  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.baseUrl}/doctors`);
  }

  // Get pending doctors
  getPendingDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.baseUrl}/pending-doctors`);
  }

  // Get doctor by ID
  getDoctorById(userId: string): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.baseUrl}/doctors/${userId}`);
  }

  // Update doctor status
  updateDoctorStatus(userId: string, status: string): Observable<any> {
    let newStatus: number;
    let rejectionReason = '';
    
    // Convert string status to numeric values expected by API
    switch (status.toLowerCase()) {
      case 'approved':
        newStatus = 1;
        break;
      case 'rejected':
        newStatus = 2;
        rejectionReason = 'Application rejected by admin';
        break;
      case 'pending':
        newStatus = 0;
        break;
      default:
        throw new Error(`Invalid status: ${status}`);
    }
    
    const payload = {
      newStatus: newStatus,
      rejectionReason: rejectionReason
    };
    
    return this.http.put(`${this.baseUrl}/doctors/${userId}/status`, payload);
  }

  // Get all patients
  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.baseUrl}/patients`);
  }

  // Get all appointments
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments`);
  }
}

