import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Authiserviceservice } from '../services/authntication/Authiservice.service';

@Injectable({
  providedIn: 'root'
})
export class RoleAuthGuard implements CanActivate {

  constructor(private authService: Authiserviceservice, private router: Router) {}

  canActivate(): boolean {
    // Use userData.getValue() to get the current value from BehaviorSubject
    const user = this.authService.userData.getValue();

    if (!user) {
      this.router.navigate(['/unauthorized']); // Or login page
      return false;
    }

    // Ensure roles array exists and user has roles property
    const allowedRoles = ['Admin', 'Doctor','Patient']; // Case-sensitive match with token roles
    const hasAccess = user.roles?.some((role: string) => allowedRoles.includes(role)); // Add explicit type 'string' for role

    if (!hasAccess) {
      this.router.navigate(['/unauthorized']);
      return false; // Return false if access is not granted
    }

    return true; // Return true if access is granted
  }
}

