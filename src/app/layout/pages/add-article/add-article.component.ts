import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // Import ChangeDetectorRef
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Subscription } from 'rxjs'; // Import Subscription
import { ArticleService, CreateArticleQueryParams } from '../../../shared/services/article/article.service'; // Import updated service and interface
import { Authiserviceservice } from '../../../shared/services/authntication/Authiservice.service'; // Import AuthService

// Define an interface for the decoded user data based on the example provided
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
  nameid?: string; // Assuming 'nameid' might hold the user ID, adjust if different
  sub?: string; // Or 'sub' might hold the user ID
  // Add other potential ID claims
}

@Component({
  selector: 'app-add-article',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EditorModule
  ],
  templateUrl: './add-article.component.html',
  styleUrls: ['./add-article.component.css']
})
export class AddArticleComponent implements OnInit, OnDestroy { // Implement OnDestroy
  articleForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null; // Property to store the blob URL for preview
  isSubmitting = false;
  errorMessage: string | null = null;
  private userSubscription: Subscription | null = null; // Subscription property
  currentUser: DecodedToken | null = null; // Property to hold user data

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
    // Add other categories as defined by the ArticleCategory enum
  ];

  tinymceConfig = {
    base_url: '/assets/tinymce', // Corrected base_url
    plugins: 'lists link image table code help wordcount',
    toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | code',
    menubar: false,
    api_key: 'ie3vm60z5ph0zx26fpdtetesh93yyaklk5xblq8dj3kkwd8t'
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private articleService: ArticleService,
    private authService: Authiserviceservice, // Injected AuthService
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.articleForm = this.fb.group({
      title: ['', Validators.required],
      summary: ['', Validators.required],
      category: [null, Validators.required],
      tags: ['',Validators.required],
      content: ['', Validators.required],
      image: [null, Validators.required]
    });

    // Subscribe to user data changes
    this.userSubscription = this.authService.userData.subscribe(user => {
      this.currentUser = user;
      // Optionally call decodeUserData if userData is null initially and token exists
      if (!user && typeof window !== 'undefined' && localStorage.getItem('token')) { // Check for browser environment
        this.authService.decodeUserData();
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.userSubscription?.unsubscribe();
    // Revoke the object URL to avoid memory leaks
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Revoke the previous URL if it exists
      if (this.imagePreviewUrl) {
        URL.revokeObjectURL(this.imagePreviewUrl);
      }
      this.selectedFile = file;
      // Create a new object URL and store it in the property
      this.imagePreviewUrl = URL.createObjectURL(file);
      this.articleForm.patchValue({ image: file });
      this.articleForm.get('image')?.updateValueAndValidity();
      // Manually trigger change detection if needed, though often not necessary here
      // this.cdr.detectChanges();
    } else {
        // Handle case where file selection is cancelled
        if (this.imagePreviewUrl) {
            URL.revokeObjectURL(this.imagePreviewUrl);
        }
        this.selectedFile = null;
        this.imagePreviewUrl = null;
        this.articleForm.patchValue({ image: null });
        this.articleForm.get('image')?.updateValueAndValidity();
    }
  }

  // createObjectURL method is removed as it's no longer called directly in the template
  // createObjectURL(file: File): string {
  //   return URL.createObjectURL(file);
  // }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.articleForm.invalid || !this.selectedFile) {
      console.log('Form is invalid or file not selected');
      this.articleForm.markAllAsTouched();
      if (this.articleForm.get('content')?.invalid) {
        console.log('Content is required.');
      }
      if (!this.selectedFile && this.articleForm.get('image')?.touched) {
        console.log('Image is required.');
      }
      return;
    }

    this.isSubmitting = true;

    // Get Author ID from AuthService
    const userIdClaim = this.currentUser?.nameid || this.currentUser?.sub; // Adjust claim name as needed
    const authorId = userIdClaim || "419c725a-7792-4b1f-b9cd-5a9896b98bd2"; // Use fallback if no user or ID claim

    console.log(`Using Author ID: ${authorId}`);

    // Prepare Query Parameters
    const queryParams: CreateArticleQueryParams = {
      Title: this.articleForm.get('title')?.value,
      Summary: this.articleForm.get('summary')?.value,
      Category: this.articleForm.get('category')?.value,
      Tags: this.articleForm.get('tags')?.value || '', // Ensure Tags is not null
      authorId: authorId
    };

    // Prepare FormData
    const formData = new FormData();
    formData.append('Content', this.articleForm.get('content')?.value);
    if (this.selectedFile) {
      formData.append('Image', this.selectedFile, this.selectedFile.name);
    }
    console.log('Query Params:', queryParams);
    console.log('FormData prepared. Sending to service...');

    // Call updated service method
    this.articleService.addArticle(queryParams, formData).subscribe({
      next: (response) => {
        console.log('Article added successfully', response);
        this.isSubmitting = false;
        this.router.navigate(['/article']);
      },
      error: (error) => {
        console.error('Error adding article', error);
        this.errorMessage = `Failed to add article: ${error.message || 'Please try again.'}`;
        if (error.error && typeof error.error === 'object') {
          this.errorMessage += ` Details: ${JSON.stringify(error.error)}`;
        }
        this.isSubmitting = false;
      }
    });
  }
}

