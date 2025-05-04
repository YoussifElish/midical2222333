import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { Subscription } from 'rxjs';
import { Article, ArticleService, UpdateArticleQueryParams } from '../../../shared/services/article/article.service'; // Import updated service and interface
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service';
import { PLATFORM_ID } from '@angular/core';

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
  selector: 'app-edit-article',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EditorModule,
  ],
  templateUrl: './edit-article.component.html',
  styleUrls: ['./edit-article.component.css']
})
export class EditArticleComponent implements OnInit, OnDestroy {
  articleForm!: FormGroup;
  selectedFile: File | null = null;
  existingImageUrl: string | null | undefined = null;
  articleId: number | null = null;
  isSubmitting = false;
  isLoading = true;
  errorMessage: string | null = null;

  private routeSubscription: Subscription | null = null;
  private articleSubscription: Subscription | null = null;
  private userSubscription: Subscription | null = null;

  currentUser: DecodedToken | null = null;

  categories = [
    { id: 0, name: 'Cardiology' },
    { id: 1, name: 'Dermatology' },
    { id: 2, name: 'Neurology' },
    { id: 3, name: 'Pediatrics' },
    { id: 4, name: 'Psychiatry' },
    { id: 5, name: 'Oncology' },
    { id: 6, name: 'Endocrinology' },
    { id: 7, name: 'Gastroenterology' },
    { id: 8, name: 'Pulmonology' },
    { id: 9, name: 'Nephrology' },
    { id: 10, name: 'Ophthalmology' },
    { id: 11, name: 'Otolaryngology' },
    { id: 12, name: 'Rheumatology' },
    { id: 13, name: 'Obstetrics' },
    { id: 14, name: 'Gynecology' },
    { id: 15, name: 'Infectious Diseases' },
    { id: 16, name: 'Hematology' },
    { id: 17, name: 'Immunology' },
    { id: 18, name: 'Urology' },
    { id: 19, name: 'Orthopedics' },
    { id: 20, name: 'Dentistry' },
    { id: 21, name: 'Nutrition' },
    { id: 22, name: 'Mental Health' },
    { id: 23, name: 'General Medicine' },
    { id: 24, name: 'Family Medicine' },
    { id: 25, name: 'Emergency Medicine' },
    { id: 26, name: 'Anesthesiology' },
    { id: 27, name: 'Public Health' },
    { id: 28, name: 'Physical Therapy' },
    { id: 29, name: 'Radiology' },
    { id: 30, name: 'Pathology' },
    { id: 31, name: 'Genetic Medicine' }
  ];

  tinymceConfig = {
    base_url: '/assets/tinymce', // Corrected base_url
    plugins: 'lists link autolink quickbars searchreplace image table visualblocks pagebreak code help wordcount directionality code emoticons typography casechange anchor autoresize image table wordcount  media lists advlist preview insertdatetime importcss autosave tinycomments',
    toolbar: 'undo redo | formatselect | searchreplace | bold italic | pagebreak | visualblocks | emoticons | ltr rtl | alignleft aligncenter alignright | code | typography | casechange | preview | bullist | link | anchor | media | restoredraft | insertdatetime | addcomment showcomments | image | table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | wordcount ',
    menubar: false,
    min_height: 100,
    tinycomments_author: 'author',
  tinycomments_author_name: 'Name of the commenter',
  tinycomments_mode: 'embedded',
    content_css: '/my-styles.css',
    importcss_append: true,
    api_key: 'ie3vm60z5ph0zx26fpdtetesh93yyaklk5xblq8dj3kkwd8t'
  };
  
  editorContent = ''; // هنا هيتخزن المحتوى

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private articleService: ArticleService,
    private authService: Authiserviceservice,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.articleForm = this.fb.group({
      title: ['', Validators.required],
      summary: ['', Validators.required],
      category: [null, Validators.required],
      tags: ['', Validators.required], // Made tags required as per API? Check API docs if optional
      content: ['', Validators.required],
      image: [null] // Image is optional on update
    });

    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.articleId = +id;
        this.loadArticleData(this.articleId);
      } else {
        this.isLoading = false;
        this.errorMessage = 'Article ID not found.';
      }
    });

    this.userSubscription = this.authService.userData.subscribe(user => {
      this.currentUser = user;
      if (!user && isPlatformBrowser(this.platformId) && localStorage.getItem('token')) {
        this.authService.decodeUserData();
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.articleSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  loadArticleData(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.articleSubscription = this.articleService.getArticleById(id).subscribe({
      next: (article) => {
        const userIdClaim = this.currentUser?.nameid || this.currentUser?.sub;
        const isAdmin = this.currentUser?.roles?.includes('Admin');

        // Authorization check - ensure user is admin or author
        if (!isAdmin && article.authorId !== userIdClaim) {
          this.errorMessage = 'You are not authorized to edit this article.';
          this.isLoading = false;
          this.articleForm.disable(); // Disable form if not authorized
          return;
        }

        this.articleForm.patchValue({
          title: article.title,
          summary: article.summary || '',
          category: article.category,
          tags: Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || ''), // Handle tags correctly
          content: article.content
        });

        this.existingImageUrl = article.imageUrl;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading article', error);
        this.errorMessage = 'Failed to load article data.';
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.articleForm.patchValue({ image: file });
      this.existingImageUrl = null; // Clear existing image URL if new file is selected
    } else {
      // Keep existing image if no new file is selected, or handle clearing if needed
      // this.selectedFile = null;
      // this.articleForm.patchValue({ image: null });
    }
  }

  createObjectURL(file: File): string {
    return URL.createObjectURL(file);
  }

  onSubmit(): void {
    this.errorMessage = null;
  
    if (this.articleForm.invalid || !this.articleId) {
      console.log('Form is invalid or Article ID missing');
      this.articleForm.markAllAsTouched();
      return;
    }
  
    this.isSubmitting = true;
  
    // Prepare Query Parameters
    const queryParams: UpdateArticleQueryParams = {
      id: this.articleId,
      Title: this.articleForm.get('title')?.value,
      Summary: this.articleForm.get('summary')?.value,
      Category: this.articleForm.get('category')?.value,
      Tags: this.articleForm.get('tags')?.value || '' // Ensure Tags is not null
    };
  
    // Prepare FormData (only Content and optional Image)
    const formData = new FormData();
    formData.append('Content', this.articleForm.get('content')?.value);
  
    // If a new image is selected, append it to the FormData
    if (this.selectedFile) {
      formData.append('Image', this.selectedFile, this.selectedFile.name);
    } else {
      // If no new image is selected, append null for the Image field
      formData.append('Image', null as any); // Send null explicitly for the image
    }
  
    // Now, send the FormData along with queryParams
    this.submitFormData(formData, queryParams);
  }
  
  submitFormData(formData: FormData, queryParams: UpdateArticleQueryParams) {
    console.log('Query Params:', queryParams);
    console.log('FormData prepared. Sending to service...');
  
    // Call updated service method
    this.articleService.updateArticle(queryParams, formData).subscribe({
      next: (response) => {
        console.log('Article updated successfully', response);
        this.isSubmitting = false;
        this.router.navigate(['/article', this.articleId]); // Navigate back to the article detail page
      },
      error: (error) => {
        console.error('Error updating article', error);
        this.errorMessage = `Failed to update article: ${error.message || 'Please try again.'}`;
        if (error.error && typeof error.error === 'object') {
          this.errorMessage += ` Details: ${JSON.stringify(error.error)}`;
        }
        this.isSubmitting = false;
      }
    });
  }
  
  

  
  
  
}

