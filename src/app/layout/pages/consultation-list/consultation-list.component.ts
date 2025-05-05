import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ConsultationService, Question } from '../../../shared/services/consultation.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-consultation-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './consultation-list.component.html',
  styleUrls: ['./consultation-list.component.css']
})
export class ConsultationListComponent implements OnInit {
  questions: Question[] = [];
  isLoading = true;
  error: string | null = null;
  pageNumber = 1;
  pageSize = 10;
  totalPages = 1;
  hasPreviousPage = false;
  hasNextPage = false;

  faThumbsUp = faThumbsUp;
  faThumbsDown = faThumbsDown;

  constructor(private consultationService: ConsultationService) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.isLoading = true;
    this.error = null;
    this.consultationService.getAllQuestions(this.pageNumber, this.pageSize).subscribe({
      next: (response) => {
        this.questions = response.items;
        this.pageNumber = response.pageNumber;
        this.totalPages = response.totalPages;
        this.hasPreviousPage = response.hasPreviousPage;
        this.hasNextPage = response.hasNextPage;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching questions:', err);
        this.error = 'Failed to load questions. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  goToPreviousPage(): void {
    if (this.hasPreviousPage) {
      this.pageNumber--;
      this.loadQuestions();
    }
  }

  goToNextPage(): void {
    if (this.hasNextPage) {
      this.pageNumber++;
      this.loadQuestions();
    }
  }

  upVoteQuestion(questionId: number): void {
    this.consultationService.upVoteQuestion(questionId).subscribe({
      next: () => {
        const question = this.questions.find(q => q.id === questionId);
        if (question) {
          question.upvotes++;
        }
      },
      error: (err) => {
        console.error('Error upvoting question:', err);
        this.error = 'Failed to upvote question.';
      }
    });
  }

  downVoteQuestion(questionId: number): void {
    this.consultationService.downVoteQuestion(questionId).subscribe({
      next: () => {
        const question = this.questions.find(q => q.id === questionId);
        if (question) {
          question.downvotes++;
        }
      },
      error: (err) => {
        console.error('Error downvoting question:', err);
        this.error = 'Failed to downvote question.';
      }
    });
  }
}