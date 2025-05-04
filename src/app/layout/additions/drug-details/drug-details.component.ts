import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Import Router
import { CommonModule } from '@angular/common';
import { DrugService, Drug } from '../../../shared/services/drug/drug.service'; // Adjust path as needed
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service'; // Import Auth Service
import { Observable, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-drug-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drug-details.component.html',
  styleUrls: ['./drug-details.component.css']
})
export class DrugDetailsComponent implements OnInit {
  drug: Drug | undefined;
  isLoading = true;
  error: string | null = null;
  isAdmin = false;
  private drugSubscription: Subscription | undefined;
  private drugId: number | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router, // Inject Router
    private drugService: DrugService,
    private authService: Authiserviceservice // Inject Auth Service
  ) {}

  ngOnInit(): void {
    this.checkAdminRole(); // Check user role

    this.drugSubscription = this.route.paramMap.pipe(
      switchMap(params => {
        const idParam = params.get('id');
        if (idParam) {
          this.drugId = +idParam; // Convert string 'id' to a number
          if (!isNaN(this.drugId)) {
            this.isLoading = true;
            this.error = null;
            return this.drugService.getDrugById(this.drugId);
          } else {
            this.error = 'Invalid Drug ID provided.';
            this.isLoading = false;
            return []; // Return empty observable or handle error appropriately
          }
        } else {
          this.error = 'No Drug ID provided.';
          this.isLoading = false;
          return []; // Return empty observable or handle error appropriately
        }
      })
    ).subscribe({
      next: (drugData) => {
        this.drug = drugData;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching drug details:', err);
        this.error = 'Failed to load drug details.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.drugSubscription?.unsubscribe();
  }

  checkAdminRole(): void {
    const token = this.authService.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token); // استخدم jwtDecode هنا
        const roleClaim = decodedToken['roles'] || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  
        this.isAdmin = Array.isArray(roleClaim) ? roleClaim.includes('Admin') : roleClaim === 'Admin';
  
        console.log('Decoded Token:', decodedToken);
        console.log('Is Admin:', this.isAdmin);
      } catch (error) {
        console.error('Error decoding token:', error);
        this.isAdmin = false;
      }
    } else {
      this.isAdmin = false;
    }
  }
  deleteDrug(): void {
    if (!this.isAdmin || !this.drugId) {
      console.error('Deletion not allowed or drug ID missing.');
      return; // Or show an error message
    }

    // Optional: Add confirmation dialog
    if (!confirm(`Are you sure you want to delete the drug "${this.drug?.name}"?`)) {
        return;
    }

    this.isLoading = true; // Indicate loading state during deletion
    this.error = null;

    this.drugService.deleteDrug(this.drugId).subscribe({
      next: () => {
        console.log('Drug deleted successfully');
        this.isLoading = false;
        // Navigate back to the medicines list or show a success message
        this.router.navigate(['/Medicines']);
      },
      error: (err) => {
        console.error('Error deleting drug:', err);
        this.error = 'Failed to delete drug. Please try again.';
        this.isLoading = false;
        // Handle specific errors (e.g., unauthorized)
      }
    });
  }

  // Keep the toggleMore logic if it's still relevant
  showMore = false;
  toggleMore() {
    this.showMore = !this.showMore;
  }
}

