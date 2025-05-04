import { Component, OnInit, OnDestroy } from '@angular/core'; // Import OnDestroy
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Import Router
import { ArticleService, Article } from '../../../shared/services/article/article.service';
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service'; // Import AuthService
import { Observable, Subscription, combineLatest } from 'rxjs'; // Import Subscription and combineLatest
import { switchMap, map, tap } from 'rxjs/operators'; // Import map and tap
import { CommonModule } from '@angular/common';

// Define an interface for the decoded user data (same as in add/edit-article)
interface DecodedToken {
  email: string;
  given_name: string;
  family_name: string;
  jti: string;
  roles: string[];
  permissions: string[];
  exp: number;
  iss: string;
  aud: string;
  nameid?: string;
  sub?: string;
}

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailComponent implements OnInit, OnDestroy { // Implement OnDestroy
  article$: Observable<Article> | undefined;
  canEditDelete$: Observable<boolean> | undefined; // Observable for authorization status
  articleId: number | null = null;
  private routeSubscription: Subscription | null = null;
  private combinedSubscription: Subscription | null = null; // For combined observable

  constructor(
    private route: ActivatedRoute,
    private router: Router, // Inject Router
    private articleService: ArticleService,
    private authService: Authiserviceservice // Inject AuthService
  ) { }

  ngOnInit(): void {
    // Get article ID from route first
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.articleId = +id;
        this.loadArticleAndCheckAuth(this.articleId);
      } else {
        console.error('Article ID not found in route parameters');
        // Handle error, maybe navigate away
      }
    });

    // Ensure user data is decoded if token exists
    if (!this.authService.userData.getValue() && localStorage.getItem('userToken')) {
        this.authService.decodeUserData();
    }
  }

  loadArticleAndCheckAuth(id: number): void {
    this.article$ = this.articleService.getArticleById(id).pipe(
        tap(article => console.log('Loaded article:', article)) // Log loaded article
    );

    // Combine article data and user data to determine authorization
    this.canEditDelete$ = combineLatest([
      this.article$!,
      this.authService.userData // Use the BehaviorSubject directly
    ]).pipe(
      map(([article, user]: [Article, DecodedToken | null]) => {
        if (!user || !article) {
          return false; // No user or article loaded, cannot edit/delete
        }
        const userIdClaim = user.nameid || user.sub; // Adjust claim name as needed
        const isAdmin = user.roles?.includes('Admin');
        const isOwner = article.authorId === userIdClaim;
        console.log(`Auth Check: UserID=${userIdClaim}, AuthorID=${article.authorId}, IsAdmin=${isAdmin}, IsOwner=${isOwner}`);
        return !!(isAdmin || isOwner); // Return true if admin or owner
      }),
      tap(canEdit => console.log('Can Edit/Delete:', canEdit)) // Log auth result
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.routeSubscription?.unsubscribe();
    this.combinedSubscription?.unsubscribe();
  }

  // Method to handle article deletion
  deleteArticle(): void {
    if (!this.articleId) return;

    // Confirmation dialog
    if (confirm('Are you sure you want to delete this article?')) {
      console.log(`Attempting to delete article with ID: ${this.articleId}`);
      // Call ArticleService to delete the article
      this.articleService.deleteArticle(this.articleId).subscribe({
        next: () => {
          console.log('Article deleted successfully');
          this.router.navigate(['/article']); // Navigate to articles list
        },
        error: (error: unknown) => {
          console.error('Error deleting article', error);
          alert('Failed to delete article. Please try again.');
        }
        
      });
    }
  }

   ArticleCategory: Record<number, string> = {
    0: 'Cardiology',
    1: 'Dermatology',
    2: 'Neurology',
    3: 'Pediatrics',
    4: 'Psychiatry',
    5: 'Oncology',
    6: 'Endocrinology',
    7: 'Gastroenterology',
    8: 'Pulmonology',
    9: 'Nephrology',
    10: 'Ophthalmology',
    11: 'Otolaryngology',
    12: 'Rheumatology',
    13: 'Obstetrics',
    14: 'Gynecology',
    15: 'Infectious Diseases',
    16: 'Hematology',
    17: 'Immunology',
    18: 'Urology',
    19: 'Orthopedics',
    20: 'Dentistry',
    21: 'Nutrition',
    22: 'Mental Health',
    23: 'General Medicine',
    24: 'Family Medicine',
    25: 'Emergency Medicine',
    26: 'Anesthesiology',
    27: 'Public Health',
    28: 'Physical Therapy',
    29: 'Radiology',
    30: 'Pathology',
    31: 'Genetic Medicine'
  };


  getCategoryName(categoryId: number | undefined): string { // Allow undefined categoryId
    if (categoryId === undefined || categoryId === null) {
        return 'Unknown';
    }
    return this.ArticleCategory[categoryId] ?? 'Unknown';
  }
}