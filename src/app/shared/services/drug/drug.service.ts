import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Define an interface for the Drug data structure
export interface Drug {
  id: number;
  name: string;
  interaction : string;
  description : string;
  sideEffect : string;
  drugImage?: string;
  dosage?: string;
  // Add other relevant fields based on the actual API response
}

// Define an interface for the paginated response from the API (Keep for reference, but service returns 'any')
export interface PaginatedDrugs {
  items: Drug[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  // Adjust based on the actual API response structure
}

// Define the payload for adding a reminder
export interface ReminderPayload {
  userId: string;
  drugId: number;
  startDate: string; // ISO string format
  endDate: string;   // ISO string format
  repeatIntervalMinutes: number;
}

@Injectable({
  providedIn: 'root'
})
export class DrugService {
  private drugApiUrl = `${environment.apiUrl}/api/Drug`;
  private reminderApiUrl = `${environment.apiUrl}/api/Reminder`;

  constructor(private http: HttpClient) { }

  // Method to get drugs with pagination and search - returns 'any' to allow component flexibility
  getDrugs(pageNumber: number, pageSize: number, searchTerm?: string): Observable<any> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('SearchTerm', searchTerm);
    }

    // Return 'any' to let the component determine the structure
    return this.http.get<any>(`${this.drugApiUrl}/GetALl`, { params });
  }

  // Method to get a single drug by ID
  getDrugById(id: number): Observable<Drug> {
    return this.http.get<Drug>(`${this.drugApiUrl}/${id}`);
  }

  // Method to add a drug (Admin only - Placeholder)
  addDrug(drugData: FormData): Observable<Drug> { // Assuming form data for image upload
    // Requires authentication/authorization header
    return this.http.post<Drug>(`${this.drugApiUrl}/Add`, drugData);
  }

  // Method to delete a drug (Admin only - Placeholder)
  deleteDrug(id: number): Observable<void> {
    // Requires authentication/authorization header
    return this.http.delete<void>(`${this.drugApiUrl}/${id}`);
  }

  // Method to add a reminder (Placeholder - adjust endpoint and response structure)
  addReminder(payload: ReminderPayload): Observable<any> {
    return this.http.post<any>(`${this.reminderApiUrl}/Add`, payload);
  }
  
}

