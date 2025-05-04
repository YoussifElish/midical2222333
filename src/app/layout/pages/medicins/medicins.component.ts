import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // Import Router
import { FormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { DrugService, Drug, PaginatedDrugs } from '../../../shared/services/drug/drug.service'; // Adjust path as needed
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service'; // Import Auth Service
import { jwtDecode } from 'jwt-decode';
@Component({
  selector: 'app-medicins',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './medicins.component.html',
  styleUrls: ['./medicins.component.css']
})
export class MedicinsComponent implements OnInit, OnDestroy {
  drugs: Drug[] = [];
  isLoading = true;
  error: string | null = null;

  currentPage = 1;
  itemsPerPage = 12; // Default items per page
  totalItems = 0;
  totalPages = 0;

  private searchTermSubject = new Subject<string>();
  searchTerm: string = '';
  private searchSubscription: Subscription | undefined;

  isAdmin = false; // Property to track admin status

  constructor(
    private drugService: DrugService,
    private authService: Authiserviceservice, // Inject Auth Service
    private router: Router // Inject Router for navigation
  ) {}

  ngOnInit(): void {
    this.checkAdminRole(); // Check user role on init
    this.fetchDrugs(); // Initial fetch

    // Subscribe to search term changes with debounce
    this.searchSubscription = this.searchTermSubject.pipe(
      debounceTime(400), // Wait for 400ms pause in events
      distinctUntilChanged(), // Only emit if value has changed
      tap(term => {
        this.searchTerm = term;
        this.currentPage = 1; // Reset to first page on new search
        this.fetchDrugs(); // Fetch drugs with the new search term
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.searchSubscription?.unsubscribe();
  }
  clearSearch(): void {
    this.searchTerm = '';
    this.searchTermSubject.next('');
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
  fetchDrugs(): void {
    this.isLoading = true;
    this.error = null;
    this.drugService.getDrugs(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (response: PaginatedDrugs) => {
        if (response && Array.isArray(response.items)) {
            this.drugs = response.items;
            // Assuming the API response structure includes totalCount
            this.totalItems = response.totalCount || 0; 
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
            if (this.currentPage > this.totalPages && this.totalPages > 0) {
                this.currentPage = this.totalPages;
                this.fetchDrugs();
            } else if (this.drugs.length === 0 && this.currentPage > 1) {
                this.currentPage = 1;
                this.fetchDrugs();
            }
        } else {
            console.error('Unexpected response format for paginated drugs:', response);
            this.error = 'Failed to process drug data.';
            this.drugs = [];
            this.totalItems = 0;
            this.totalPages = 0;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching drugs:', err);
        this.error = 'Failed to load medicines. Please try again later.';
        this.isLoading = false;
        this.drugs = [];
        this.totalItems = 0;
        this.totalPages = 0;
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchTermSubject.next(term.trim());
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.fetchDrugs();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  // Method to navigate to the Add Drug page
  navigateToAddDrug(): void {
    this.router.navigate(['/Add-drug']); // Navigate to the add drug route
  }
}

