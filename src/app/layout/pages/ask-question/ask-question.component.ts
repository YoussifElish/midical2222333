import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { Router } from '@angular/router';
// Correct the import path for the service
import { ConsultationService, CreateQuestionDto } from '../../../shared/services/consultation.service';

@Component({
  selector: 'app-ask-question',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule // Add FormsModule here
  ],
  templateUrl: './ask-question.component.html',
  styleUrls: ['./ask-question.component.css']
})
export class AskQuestionComponent implements OnInit {

  newQuestion: CreateQuestionDto = { title: '', content: '' };
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess = false;

  constructor(
    private consultationService: ConsultationService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  submitQuestion(): void {
    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = false;

    this.consultationService.createQuestion(this.newQuestion).subscribe({
      // Add explicit type for createdQuestion (assuming it returns the created Question object)
      next: (createdQuestion: any) => { // Use 'any' or a specific Question interface if defined
        this.isSubmitting = false;
        this.submitSuccess = true;
        // Redirect to the new question's detail page or the list after a short delay
        setTimeout(() => {
          // Assuming the createdQuestion object has an 'id'
          if (createdQuestion && createdQuestion.id) {
            this.router.navigate(['/consultations', createdQuestion.id]);
          } else {
            this.router.navigate(['/consultations']); // Fallback to list
          }
        }, 1500); // Wait 1.5 seconds to show success message
      },
      // Add explicit type for err
      error: (err: any) => {
        console.error('Error submitting question:', err);
        this.submitError = 'Failed to submit question. Please check your input and try again.';
        this.isSubmitting = false;
      }
    });
  }
}

