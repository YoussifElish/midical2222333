import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Observable, Subject, throwError, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, tap, catchError, map } from 'rxjs/operators'; // Added map
import { DrugService, Drug, ReminderPayload, PaginatedDrugs } from '../../../shared/services/drug/drug.service'; // Import PaginatedDrugs
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service';

interface DecodedToken {
  sub?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-drug-reminder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './drug-reminder.component.html',
  styleUrls: ['./drug-reminder.component.css']
})
export class DrugReminderComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  searchResults$: Observable<Drug[]> | undefined;
  selectedDrug: Drug | null = null;
  reminderForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  userId: string | null = null;
  submitStatus: { success: boolean; message: string } | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private drugService: DrugService,
    private authService: Authiserviceservice,
    private fb: FormBuilder
  ) {
    this.reminderForm = this.fb.group({
      startDate: [this.formatDateForInput(new Date()), Validators.required],
      endDate: ['', Validators.required],
      repeatIntervalMinutes: [60, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.setupSearch();
    this.getUserIdFromToken();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private formatDateForInput(date: Date): string {
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  }

  private setupSearch(): void {
    this.searchResults$ = this.searchControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => {
        this.isLoading = true;
        this.selectedDrug = null;
        this.submitStatus = null;
      }),
      switchMap(term => {
        if (!term || term.length < 1) {
          this.isLoading = false;
          return of([]); // Return Observable<Drug[]>
        }
        // Use getDrugs for searching, map the result to Drug[]
        return this.drugService.getDrugs(1, 10, term).pipe( // Use getDrugs with page 1, size 10
          map((response: PaginatedDrugs) => response.items || []), // Extract items array
          catchError((err): Observable<Drug[]> => {
            console.error('Error searching drugs:', err);
            this.isLoading = false;
            this.submitStatus = { success: false, message: 'Error searching for drugs.' };
            return of([]); // Return Observable of empty array on error
          })
        );
      }),
      tap(() => this.isLoading = false)
    );
  }

  private getUserIdFromToken(): void {
    const token = localStorage.getItem('userToken');
    if (token) {
        try {
            if (!this.authService.userData.getValue()) {
                this.authService.decodeUserData();
            }
            const currentUserData: DecodedToken | null = this.authService.userData.getValue();
            if (currentUserData && currentUserData.sub) {
                this.userId = currentUserData.sub;
                console.log('User ID found:', this.userId);
            } else {
                 console.warn('User ID claim (e.g., sub) not found in decoded token:', currentUserData);
                 this.submitStatus = { success: false, message: 'Could not verify user identity.' };
            }
        } catch (error) {
            console.error('Error processing token:', error);
            this.userId = null;
            this.submitStatus = { success: false, message: 'Error processing user identity.' };
        }
    } else {
        console.error('User token not found in localStorage.');
        this.userId = null;
        this.submitStatus = { success: false, message: 'User not logged in.' };
    }

    this.authService.userData.pipe(takeUntil(this.destroy$)).subscribe((userData: DecodedToken | null) => {
        if (userData && userData.sub) {
            this.userId = userData.sub;
        } else {
            this.userId = null;
        }
    });
  }

  selectDrug(drug: Drug): void {
    this.selectedDrug = drug;
    this.searchControl.setValue(drug.name, { emitEvent: false });
    this.searchResults$ = undefined;
    this.submitStatus = null;
    console.log('Selected Drug ID:', this.selectedDrug.id);
  }

  clearSelection(): void {
    this.selectedDrug = null;
    this.searchControl.setValue('');
    this.submitStatus = null;
  }

  onSubmitReminder(): void {
    this.submitStatus = null;
    if (!this.userId) {
        this.submitStatus = { success: false, message: 'User ID is missing. Cannot set reminder.' };
        console.error('User ID missing.');
        return;
    }
    if (!this.selectedDrug) {
        this.submitStatus = { success: false, message: 'Please select a drug first.' };
        console.error('Drug not selected.');
        return;
    }
    if (this.reminderForm.invalid) {
        this.submitStatus = { success: false, message: 'Please fill in all required fields correctly.' };
        this.reminderForm.markAllAsTouched();
        console.error('Form is invalid.');
        return;
    }

    this.isSubmitting = true;
    const formValue = this.reminderForm.value;
    const startDateUTC = new Date(formValue.startDate).toISOString();
    const endDateUTC = new Date(formValue.endDate).toISOString();

    const reminderData: ReminderPayload = {
      userId: this.userId,
      drugId: this.selectedDrug.id,
      startDate: startDateUTC,
      endDate: endDateUTC,
      repeatIntervalMinutes: parseInt(formValue.repeatIntervalMinutes, 10)
    };

    console.log('Submitting Reminder:', reminderData);

    this.drugService.addReminder(reminderData).pipe(
      takeUntil(this.destroy$),
      tap(response => {
        console.log('API Response:', response);
        this.submitStatus = { success: true, message: 'Reminder set successfully!' };
        this.isSubmitting = false;
      }),
      catchError(error => {
        console.error('Error submitting reminder:', error);
        this.submitStatus = { success: false, message: `Failed to set reminder. ${error.message || ''}` };
        this.isSubmitting = false;
        return throwError(() => error);
      })
    ).subscribe();
  }
}

