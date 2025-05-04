import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ProfileService, UserProfileDto, DoctorProfileDto } from '../../../shared/services/profile/profile.service'; // Import DTOs

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive , CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] 
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLogin: boolean = false;
  profileImageUrl: string | null = null; 
  userFullName: string | null = null; 
  userRole: string | null = null; // Added userRole
  userId: string | null = null;   // Added userId
  private userSub: Subscription | null = null;
  private profileSub: Subscription | null = null;

  constructor(
    public _Authiserviceservice: Authiserviceservice,
    private profileService: ProfileService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSub = this._Authiserviceservice.userData.subscribe(user => {
      this.isLogin = !!user;
      if (this.isLogin && user) { // Check if user is not null
        this.userRole = user.role; // Assuming role is available in user object
        this.userId = user.nameid; // Assuming userId is available as nameid
        this.fetchProfileData();
      } else {
        // Reset profile data and user info on logout
        this.profileImageUrl = null;
        this.userFullName = null;
        this.userRole = null;
        this.userId = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.profileSub?.unsubscribe();
  }

  fetchProfileData(): void {
    this.profileSub = this.profileService.getProfile().subscribe({
      next: (profile: UserProfileDto | DoctorProfileDto) => { // Use imported DTOs
        this.userFullName = profile.fullName;
        // Ensure the path is correctly formed if it's relative from the API
        this.profileImageUrl = profile.profileImageUrl ? profile.profileImageUrl : 'assets/images/default-avatar.png'; 
      },
      error: (err) => {
        console.error('Error fetching profile data:', err);
        this.userFullName = 'User'; // Fallback name
        this.profileImageUrl = 'assets/images/default-avatar.png'; // Fallback image
      }
    });
  }

  logout(): void {
    this._Authiserviceservice.logout();
    this.router.navigate(['/home']); 
  }

    darkMode: boolean = false;

    toggleDarkmode() {
      this.darkMode = !this.darkMode;

      if (this.darkMode) {
        document.body.setAttribute('data-bs-theme', 'dark');
      } else {
        document.body.setAttribute('data-bs-theme', 'light');
      }
    }
}
 
