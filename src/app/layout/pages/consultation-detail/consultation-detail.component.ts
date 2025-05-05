import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConsultationService, Question, Answer, CreateAnswerDto } from '../../../shared/services/consultation.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-consultation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FontAwesomeModule],
  templateUrl: './consultation-detail.component.html',
  styleUrls: ['./consultation-detail.component.css']
})
export class ConsultationDetailComponent implements OnInit, OnDestroy {
  question: Question | null = null;
  isLoading = true;
  error: string | null = null;
  private routeSub: Subscription | null = null;

  newAnswer: CreateAnswerDto = { content: '', questionId: 0 }; // Keep questionId for service
  submittingAnswer = false;
  answerError: string | null = null;

  votingQuestion: number | null = null;
  votingAnswer: number | null = null;

  faThumbsUp = faThumbsUp;
  faThumbsDown = faThumbsDown;

  constructor(
    private route: ActivatedRoute,
    private consultationService: ConsultationService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const questionId = +params['id'];
      if (questionId) {
        this.newAnswer.questionId = questionId; // Set questionId for new answer
        this.loadQuestionDetails(questionId);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  loadQuestionDetails(id: number): void {
    this.isLoading = true;
    this.error = null;
    this.consultationService.getQuestionById(id).subscribe({
      next: (data: Question) => {
        this.question = data;
        if (!this.question.answers) {
          this.loadAnswers(id);
        } else {
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        console.error('Error fetching question details:', err);
        this.error = 'Failed to load question details. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  loadAnswers(questionId: number): void {
    this.consultationService.getAnswersForQuestion(questionId).subscribe({
      next: (answers: Answer[]) => {
        if (this.question) {
          this.question.answers = answers;
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching answers:', err);
        this.error = 'Failed to load answers.';
        this.isLoading = false;
      }
    });
  }

  submitAnswer(): void {
    if (!this.question || !this.newAnswer.content.trim()) return;

    this.submittingAnswer = true;
    this.answerError = null;

    this.consultationService.createAnswer(this.newAnswer).subscribe({
      next: (createdAnswer: Answer) => {
        if (this.question) {
          if (!this.question.answers) {
            this.question.answers = [];
          }
          this.question.answers.push(createdAnswer);
          this.question.answerCount++;
          this.newAnswer.content = '';
        }
        this.submittingAnswer = false;
      },
      error: (err: any) => {
        console.error('Error submitting answer:', err);
        this.answerError = err.status === 401
          ? 'You are not authorized to submit answers.'
          : 'Failed to submit answer. Please try again.';
        this.submittingAnswer = false;
      }
    });
  }

  voteQuestion(questionId: number, direction: 'up' | 'down'): void {
    if (this.votingQuestion) return;
    this.votingQuestion = questionId;

    const voteObservable = direction === 'up'
      ? this.consultationService.upVoteQuestion(questionId)
      : this.consultationService.downVoteQuestion(questionId);

    voteObservable.subscribe({
      next: () => {
        if (this.question) {
          if (direction === 'up') this.question.upvotes++;
          else this.question.downvotes++;
        }
        this.votingQuestion = null;
      },
      error: (err: any) => {
        console.error(`Error ${direction}voting question:`, err);
        this.error = `Failed to ${direction}vote question.`;
        this.votingQuestion = null;
      }
    });
  }

  voteAnswer(answerId: number, direction: 'up' | 'down'): void {
    if (this.votingAnswer) return;
    this.votingAnswer = answerId;

    const voteObservable = direction === 'up'
      ? this.consultationService.upVoteAnswer(answerId)
      : this.consultationService.downVoteAnswer(answerId);

    voteObservable.subscribe({
      next: () => {
        if (this.question && this.question.answers) {
          const answer = this.question.answers.find(a => a.id === answerId);
          if (answer) {
            if (direction === 'up') answer.upvotes++;
            else answer.downvotes++;
          }
        }
        this.votingAnswer = null;
      },
      error: (err: any) => {
        console.error(`Error ${direction}voting answer:`, err);
        this.error = `Failed to ${direction}vote answer.`;
        this.votingAnswer = null;
      }
    });
  }
}