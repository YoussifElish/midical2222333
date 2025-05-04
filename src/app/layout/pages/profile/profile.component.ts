import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ProfileService, UserProfileDto, DoctorProfileDto, ChangePasswordRequest } from '../../../shared/services/profile/profile.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service';
import { DoctorAvailabilityComponent } from '../doctor-availability/doctor-availability.component';
import { DoctorAppointmentsComponent } from '../doctor-appointments/doctor-appointments.component';

export interface UserSession {
  id: number;
  sessionToken: string;
  userAgent: string;
  ipAddress: string;
  lastActivity: string;
  expiryAt: string;
  isActive: boolean;
  userId: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    DoctorAvailabilityComponent,
    DoctorAppointmentsComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile: UserProfileDto | DoctorProfileDto | null = null;
  isDoctor: boolean = false;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  activeTab: string = 'info';
  sessions: UserSession[] = [];
  isLoadingSessions: boolean = false;
  imagePreviewUrl: string | ArrayBuffer | null = null; // Added for image preview
  terminatingSessionId: number | null = null; // Added for session termination spinner
  terminatingAll: boolean = false; // Added for terminate all spinner

  get doctorProfile(): DoctorProfileDto | null {
    return this.isDoctor && this.profile ? (this.profile as DoctorProfileDto) : null;
  }

  get userProfile(): UserProfileDto | null {
    return !this.isDoctor && this.profile ? (this.profile as UserProfileDto) : null;
  }

  changeEmailForm: FormGroup;
  changePasswordForm: FormGroup;
  profileImageFile: File | null = null;

  private profileSub: Subscription | null = null;
  private sessionsSub: Subscription | null = null;
  private updateSub: Subscription | null = null;

  constructor(
    private profileService: ProfileService,
    private fb: FormBuilder,
    private router: Router,
    private authService: Authiserviceservice
  ) {
    this.changeEmailForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.email]]
    });
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  currentSessionToken: string | null = null;

  ngOnInit(): void {
    this.currentSessionToken = localStorage.getItem('userToken');
    this.fetchProfile();
  }

  ngOnDestroy(): void {
    this.profileSub?.unsubscribe();
    this.sessionsSub?.unsubscribe();
    this.updateSub?.unsubscribe();
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  fetchProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.profileSub = this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.isDoctor = this.profileService.isDoctorProfile(data);
        this.isLoading = false;
        if (this.profile?.email) {
          this.changeEmailForm.patchValue({ newEmail: this.profile.email });
        }
        // Don't fetch sessions immediately, only when tab is clicked
        // this.fetchSessions();
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.errorMessage = err.error?.message || err.message || 'Failed to load profile information. Please check your connection or login status.';
        this.isLoading = false;
      }
    });
  }

  fetchSessions(): void {
    this.isLoadingSessions = true;
    this.errorMessage = null; // Clear general error when fetching sessions
    this.successMessage = null;
    this.sessionsSub = this.profileService.getSessions().subscribe({
      next: (sessionsData: UserSession[]) => {
        this.sessions = sessionsData;
        this.isLoadingSessions = false;
      },
      error: (err) => {
        console.error('Error fetching sessions:', err);
        // Set error message specific to session tab
        this.errorMessage = err.error?.message || 'Failed to load active sessions.';
        this.isLoadingSessions = false;
      }
    });
  }

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
    this.errorMessage = null;
    this.successMessage = null;
    this.imagePreviewUrl = null; // Clear preview when changing tabs
    if (tabName !== 'change-email' && this.profile?.email) this.changeEmailForm.reset({ newEmail: this.profile.email });
    if (tabName !== 'change-password') this.changePasswordForm.reset();
    if (tabName !== 'change-image') this.profileImageFile = null;
    if (tabName === 'sessions' && this.sessions.length === 0) { // Fetch only if not already loaded or forced refresh needed
      this.fetchSessions();
    }
  }

  updateEmail(): void {
    if (this.changeEmailForm.invalid) {
      this.changeEmailForm.markAllAsTouched();
      return;
    }
    this.isLoading = true; // Use general loading indicator
    this.errorMessage = null;
    this.successMessage = null;
    const newEmailValue = this.changeEmailForm.value.newEmail;
    this.updateSub = this.profileService.changeEmail(newEmailValue).subscribe({
      next: () => {
        this.successMessage = 'Email updated successfully!';
        this.isLoading = false;
        this.fetchProfile(); // Refetch profile to show updated email
      },
      error: (err) => {
        console.error('Error updating email:', err);
        this.errorMessage = err.error?.title || err.error?.message || 'Failed to update email. Please try again.';
        this.isLoading = false;
      }
    });
  }

  updatePassword(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }
    this.isLoading = true; // Use general loading indicator
    this.errorMessage = null;
    this.successMessage = null;
    const payload: ChangePasswordRequest = {
      CurrentPassword: this.changePasswordForm.value.oldPassword,
      NewPassword: this.changePasswordForm.value.newPassword,
      ConfirmPassword: this.changePasswordForm.value.confirmPassword
    };
    this.updateSub = this.profileService.changePassword(payload).subscribe({
      next: () => {
        this.successMessage = 'Password updated successfully!';
        this.changePasswordForm.reset();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error updating password:', err);
        this.errorMessage = err.error?.title || err.error?.message || 'Failed to update password. Please check your old password and try again.';
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file: File = input.files[0];
      // Validate file size and type
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.errorMessage = 'File size exceeds 5MB limit.';
        this.profileImageFile = null;
        this.imagePreviewUrl = null;
        input.value = '';
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.errorMessage = 'Invalid file type. Please upload JPG, PNG, or WebP.';
        this.profileImageFile = null;
        this.imagePreviewUrl = null;
        input.value = '';
        return;
      }
      this.profileImageFile = file;
      this.errorMessage = null;

      // Generate image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
      };
      reader.readAsDataURL(file);

      console.log('Selected file:', file.name, file.size, file.type); // Debug log
    } else {
        this.profileImageFile = null;
        this.imagePreviewUrl = null;
    }
  }

  
  updateProfileImage(): void {
    if (!this.profileImageFile) {
      this.errorMessage = 'Please select an image file first.';
      return;
    }
    this.isLoading = true; // Use general loading indicator
    this.errorMessage = null;
    this.successMessage = null;
    const formData = new FormData();
    // Use 'Image' as the key to match the backend [FromForm] UploadImageRequest property
    formData.append('Image', this.profileImageFile, this.profileImageFile.name);

    this.updateSub = this.profileService.updateProfileImage(formData).subscribe({
      next: () => {
        this.profileImageFile = null; // Clear selection
        this.successMessage = 'Profile image updated successfully!';
        // Refetch profile to update image display
        this.fetchProfile();
      },
      error: (err) => {
        console.error('Error updating profile image:', err);
        this.errorMessage = err.error?.title || err.error?.message || 'Failed to update profile image. Please try again.';
      }
    });
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  terminateSession(sessionId: number): void {
    if (!confirm(`Are you sure you want to terminate session ${sessionId}?`)) return;
    this.terminatingSessionId = sessionId; // Set loading state for specific session
    this.errorMessage = null;
    this.successMessage = null;
    this.updateSub = this.profileService.terminateSession(sessionId).subscribe({
      next: () => {
        this.successMessage = `Session ${sessionId} terminated successfully.`;
        this.terminatingSessionId = null;
        this.fetchSessions(); // Refresh session list
      },
      error: (err) => {
        console.error(`Error terminating session ${sessionId}:`, err);
        this.errorMessage = err.error?.title || err.error?.message || `Failed to terminate session ${sessionId}.`;
        this.terminatingSessionId = null;
      }
    });
  }

  terminateAllSessions(): void {
    if (!confirm('Are you sure you want to terminate all other active sessions? This will log you out.')) return;
    this.terminatingAll = true; // Set loading state for terminate all
    this.errorMessage = null;
    this.successMessage = null;
    this.updateSub = this.profileService.terminateAllSessions().subscribe({
      next: () => {
        this.successMessage = 'All other sessions terminated successfully. Logging out...';
        this.terminatingAll = false;
        setTimeout(() => this.logout(), 1500);
      },
      error: (err) => {
        console.error('Error terminating all sessions:', err);
        this.errorMessage = err.error?.title || err.error?.message || 'Failed to terminate all other sessions.';
        this.terminatingAll = false;
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch (e) {
      console.warn(`Could not format date: ${dateString}`, e);
      return dateString;
    }
  }
}