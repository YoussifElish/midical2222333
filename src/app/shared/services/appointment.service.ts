import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private apiUrl = 'https://curefusion2.runasp.net/Patient/Appointment';

  constructor(private http: HttpClient) { }

  // Fetch doctors with available appointments
  getDoctorsWithAppointments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/GetDoctorsWithAppoitments`);
  }

  // Fetch active appointments for a specific doctor
  getActiveAppointmentsByDoctorId(doctorId: number): Observable<any> {
    // Assuming the API requires the doctorId as a query parameter or part of the path
    // Adjust the URL based on the actual API specification if different
    // Example using query parameter: return this.http.get<any>(`${this.apiUrl}/GetActiveAppointmentsByDoctorId?doctorId=${doctorId}`);
    // Example using path parameter: return this.http.get<any>(`${this.apiUrl}/GetActiveAppointmentsByDoctorId/${doctorId}`);
    // The user provided URL was https://curefusion2.runasp.net/Patient/Appointment/GetActiveAppointmentsByDoctorId
    // It's unclear how the doctorId is passed. Assuming it's a query parameter for now.
    return this.http.get<any>(`${this.apiUrl}/GetActiveAppointmentsByDoctorId?Id=${doctorId}`);
  }

  // Book an appointment
  bookAppointment(appointmentId: number, notes: string): Observable<any> {
    const body = { appointmentId, notes };
    return this.http.post<any>(`${this.apiUrl}/Book`, body);
  }
}

