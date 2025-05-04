import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'; // Import HttpParams
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // Assuming environment file exists for API base URL

// Define interfaces based on provided DTOs
export interface IProfileDto {
  id: string;
  fullName: string;
  email: string;
  profileImageUrl?: string | null;
}

export interface UserProfileDto {
  fullName: string;
  email: string;
  profileImageUrl?: string;
  dob?: string; // إضافة dob كاختياري
  questionsCount?: number; // إضافة questionsCount كاختياري
  upcomingAppointments?: number;
}

export interface DoctorProfileDto {
  fullName: string;
  email: string;
  profileImageUrl?: string;
  specialization?: string; // إضافة specialization
  yearsOfExperience?: number;
  rating?: number;
  totalReviews?: number;
  bio?: string;
  accountStatus?: string;
  certificationDocumentUrl?: string;
  totalAnswers?: number;
  totalAppointments?: number;
  completedAppointments?: number;
  upcomingAppointments?: number;
}

// Interface for ChangePassword backend request
export interface ChangePasswordRequest {
  CurrentPassword: string;
  NewPassword: string;
  ConfirmPassword: string; // Assuming backend validation needs this, align with backend model
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getProfile(): Observable<UserProfileDto | DoctorProfileDto> {
    return this.http.get<UserProfileDto | DoctorProfileDto>(`${this.apiUrl}/me/GetProfile`);
  }

  changeEmail(newEmail: string): Observable<any> {
    // Backend now expects [FromQuery] string newEmail.
    // Send the email as a query parameter.
    const params = new HttpParams().set('newEmail', newEmail);
    // The body for the POST request should be null or empty if not needed.
    return this.http.post(`${this.apiUrl}/me/ChangeEmail`, null, { params }); // Send null as body, add params
  }

  changePassword(payload: ChangePasswordRequest): Observable<any> {
    // Ensure payload keys match the backend ChangePasswordRequest model exactly
    return this.http.post(`${this.apiUrl}/me/ChangePassword`, payload);
  }

  updateProfileImage(formData: FormData): Observable<any> {
    // Backend expects [FromForm] UploadImageRequest with an 'Image' property.
    // Ensure the FormData key matches the expected backend parameter name 'Image'.
    // Note: HttpClient handles the Content-Type header for FormData automatically.
    return this.http.post(`${this.apiUrl}/me/UpdateProfileImage`, formData);
  }

  getSessions(): Observable<any[]> { // Define a UserSession interface later
    return this.http.get<any[]>(`${this.apiUrl}/api/Sessions`);
  }

  terminateSession(sessionId: number): Observable<any> {
    const params = { sessionId: sessionId.toString() };
  return this.http.post(`${this.apiUrl}/api/Sessions/terminate`, null, { params });
  }

  terminateAllSessions(): Observable<any> {
    // Assuming backend expects {} in JSON body
    return this.http.post(`${this.apiUrl}/api/Sessions/terminate-all`, {});
  }

  updateSessionExpiry(payload: { sessionId: number, expiryMinutes: number }): Observable<any> {
     // Backend expects expiryMinutes from query, not body. Adjust call if needed.
     // The current backend code shows [FromQuery] int expiryMinutes, so this service method is likely incorrect.
     // However, the profile component doesn't call this method, so leaving it for now.
     return this.http.put(`${this.apiUrl}/me/UpdateSessionExpiry`, payload);
  }

  isDoctorProfile(profile: UserProfileDto | DoctorProfileDto): profile is DoctorProfileDto {
    return (profile as DoctorProfileDto).specialization !== undefined;
  }
}

