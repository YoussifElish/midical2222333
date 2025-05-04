import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DoctorAppointmentsService {
  // TODO: Replace with actual API base URL from environment configuration
  private apiUrl = 'https://curefusion2.runasp.net';

  constructor(private http: HttpClient) { }

  // Helper to get authorization headers (assuming JWT is stored in localStorage)
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Adjust key if needed
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // GET /Doctor/GetAllDoctorAppointments
  getAllDoctorAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Doctor/GetAllDoctorAppointments`, { headers: this.getAuthHeaders() });
  }

  // DELETE /Doctor/Appointment/DeleteDoctorAppointment/{id}
  // Note: User mentioned two delete endpoints. Using DeleteDoctorAppointment/{id} first.
  // Need clarification if RemoveDoctorAppointment/{appointmentId} is also needed here or elsewhere.
  deleteDoctorAppointment(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Doctor/Appointment/DeleteDoctorAppointment/${id}`, { headers: this.getAuthHeaders() });
  }

  // DELETE /Doctor/Appointment/RemoveDoctorAppointment/{appointmentId}
  // Providing this as well, might be used based on context (e.g., different type of removal)
  removeDoctorAppointment(appointmentId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Doctor/Appointment/RemoveDoctorAppointment/${appointmentId}`, { headers: this.getAuthHeaders() });
  }
}

