import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DoctorAvailabilityService {
  private apiUrl = 'https://curefusion2.runasp.net';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  addDoctorAvailability(availabilityData: any): Observable<any> {
    const payload = {
      date: availabilityData.date,
      from: availabilityData.from,
      to: availabilityData.to,
      slotDurationInMinutes: availabilityData.slotDurationInMinutes,
      pricePerSlot: availabilityData.pricePerSlot,
      sessionMode: availabilityData.sessionMode
    };
    return this.http.post<any>(`${this.apiUrl}/Doctor/Appointment/AddDoctorAvaliability`, payload, { headers: this.getAuthHeaders() });
  }

  getAllDoctorAvailabilities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Doctor/GetAllDoctorAvailabilities`, { headers: this.getAuthHeaders() });
  }

  removeDoctorAvailability(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Doctor/Appointment/RemoveDoctorAvaliability/${id}`, { headers: this.getAuthHeaders() });
  }
}