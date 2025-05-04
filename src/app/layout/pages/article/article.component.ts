import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ArticleService, Article, ArticleParams } from '../../../shared/services/article/article.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, switchMap, tap, Subject, debounceTime, distinctUntilChanged, takeUntil, Subscription, catchError, of, map } from 'rxjs';
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

interface Category {
  id: number;
  name: string;
  articleCount: number;
}

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleComponent implements OnInit, OnDestroy {
  articles$!: Observable<Article[]>;
  currentUser: DecodedToken | null = null;
  private userSubscription: Subscription | null = null;

  currentPage = 1;
  pageSize = 6;
  hasMorePages = true;
  totalArticlesCount = 0;
  errorMessage: string | null = null;
  defaultImagePath = '/assets/images/default-article.jpg';

  searchTerm = '';
  selectedCategory: number | null = null;
  selectedTag = '';
  sortBy = '';
  sortDescending = false;

  categories: Category[] = [
    { id: 0, name: 'Cardiology', articleCount: 0 },
    { id: 1, name: 'Dermatology', articleCount: 0 },
    { id: 2, name: 'Neurology', articleCount: 0 },
    { id: 3, name: 'Pediatrics', articleCount: 0 },
    { id: 4, name: 'Psychiatry', articleCount: 0 },
    { id: 5, name: 'Oncology', articleCount: 0 },
    { id: 6, name: 'Endocrinology', articleCount: 0 },
    { id: 7, name: 'Gastroenterology', articleCount: 0 },
    { id: 8, name: 'Pulmonology', articleCount: 0 },
    { id: 9, name: 'Nephrology', articleCount: 0 },
    { id: 10, name: 'Ophthalmology', articleCount: 0 },
    { id: 11, name: 'Otolaryngology', articleCount: 0 },
    { id: 12, name: 'Rheumatology', articleCount: 0 },
    { id: 13, name: 'Obstetrics', articleCount: 0 },
    { id: 14, name: 'Gynecology', articleCount: 0 },
    { id: 15, name: 'Infectious Diseases', articleCount: 0 },
    { id: 16, name: 'Hematology', articleCount: 0 },
    { id: 17, name: 'Immunology', articleCount: 0 },
    { id: 18, name: 'Urology', articleCount: 0 },
    { id: 19, name: 'Orthopedics', articleCount: 0 },
    { id: 20, name: 'Dentistry', articleCount: 0 },
    { id: 21, name: 'Nutrition', articleCount: 0 },
    { id: 22, name: 'Mental Health', articleCount: 0 },
    { id: 23, name: 'General Medicine', articleCount: 0 },
    { id: 24, name: 'Family Medicine', articleCount: 0 },
    { id: 25, name: 'Emergency Medicine', articleCount: 0 },
    { id: 26, name: 'Anesthesiology', articleCount: 0 },
    { id: 27, name: 'Public Health', articleCount: 0 },
    { id: 28, name: 'Physical Therapy', articleCount: 0 },
    { id: 29, name: 'Radiology', articleCount: 0 },
    { id: 30, name: 'Pathology', articleCount: 0 },
    { id: 31, name: 'Genetic Medicine', articleCount: 0 }
  ];

  tags: string[] = [];
  latestArticles: Article[] = [];

  sortOptions = [
    { value: '', label: 'Default' },
    { value: 'title', label: 'Title' },
    { value: 'PublishedDate', label: 'Date Created' },
  ];

  private paramsSubject = new BehaviorSubject<ArticleParams>({});
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private articleService: ArticleService,
    private authService: Authiserviceservice,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.userData.subscribe(user => {
      this.currentUser = user as DecodedToken | null;
      if (!user && localStorage.getItem('token')) {
        this.authService.decodeUserData();
      }
    });

    this.updateParams();
    this.loadTags();
    this.loadLatestArticles();

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.applyFilters();
    });

    this.articles$ = this.paramsSubject.pipe(
      switchMap(params => this.articleService.getAllArticles(params).pipe(
        map(articles => {
          articles.forEach(article => {
            if (typeof article.tags === 'string') {
              article.tags = (article.tags as string).split(',').map(tag => tag.trim());
            }
          });
          this.hasMorePages = articles.length === this.pageSize;
          this.updateCategoryCounts(articles);
          return articles;
        }),
        catchError(error => {
          console.error('Error fetching articles:', error);
          this.errorMessage = 'Failed to load articles. Please try again later.';
          this.hasMorePages = false;
          return of([]);
        })
      )),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.userSubscription?.unsubscribe();
  }

  canAddArticle(): boolean {
    if (!this.currentUser || !this.currentUser.roles) return false;
    return this.currentUser.roles.includes('Admin') || this.currentUser.roles.includes('Doctor');
  }

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  getContentPreview(content: string): SafeHtml {
    const textPreview = content.slice(0, 300);
    return this.sanitizer.bypassSecurityTrustHtml(textPreview + '...');
  }

  updateParams(): void {
    const params: ArticleParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      ...(this.searchTerm && { searchTerm: this.searchTerm }),
      ...(this.selectedCategory !== null && { category: this.selectedCategory }),
      ...(this.selectedTag && { tag: this.selectedTag }),
      ...(this.sortBy && { sortBy: this.sortBy }),
      ...(this.sortBy && { sortDescending: this.sortDescending })
    };
    this.paramsSubject.next(params);
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.updateParams();
  }

  onTagClick(tag: string): void {
    this.selectedTag = tag;
    this.applyFilters();
  }

  clearTagFilter(): void {
    this.selectedTag = '';
    this.applyFilters();
  }

  loadPage(page: number): void {
    if (page < 1) return;
    this.currentPage = page;
    this.updateParams();
  }

  nextPage(): void {
    this.loadPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.loadPage(this.currentPage - 1);
  }

  loadTags(): void {
    this.articleService.getAllArticles({ pageSize: 1000 }).subscribe(articles => {
      const tagsSet = new Set<string>();
      articles.forEach(article => {
        if (article.tags) {
          (Array.isArray(article.tags) ? article.tags : (article.tags as string).split(',').map(tag => tag.trim()))
            .forEach(tag => tagsSet.add(tag));
        }
      });
      this.tags = Array.from(tagsSet);
    });
  }

  loadLatestArticles(): void {
    this.articleService.getAllArticles({
      pageSize: 5,
      sortBy: 'PublishedDate',
      sortDescending: true
    }).subscribe(articles => {
      this.latestArticles = articles;
    });
  }

  updateCategoryCounts(articles: Article[]): void {
    this.categories = this.categories.map(category => ({
      ...category,
      articleCount: 0
    }));

    const counts: { [key: number]: number } = {};
    articles.forEach(article => {
      if (article.category !== undefined && article.category !== null) {
        counts[article.category] = (counts[article.category] || 0) + 1;
      }
    });

    this.categories = this.categories.map(category => ({
      ...category,
      articleCount: counts[category.id] || 0
    }));

    this.totalArticlesCount = Object.values(counts).reduce((sum, count) => sum + count, 0);
  }

  getCategoryName(categoryId?: number): string {
    if (categoryId === undefined || categoryId === null) return 'General';
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'General';
  }

  trackByArticleId(index: number, article: Article): number {
    return article.id;
  }
}
