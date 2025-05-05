import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Define interfaces for expected data structures
export interface Answer {
  id: number; // Changed to camelCase for consistency
  questionId: number;
  content: string;
  createdIn: string;
  userId?: string;
  userName?: string;
  upvotes: number;
  downvotes: number;
}

export interface Question {
  id: number; // Changed to camelCase
  title: string;
  content: string;
  createdIn: string;
  answerCount: number;
  userId: string;
  userName: string;
  upvotes: number;
  downvotes: number;
  repliedByDoctorId?: string | null;
  answers: Answer[];
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateQuestionDto {
  title: string; // Changed to camelCase
  content: string;
}

export interface CreateAnswerDto {
  content: string;
  questionId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private apiUrl = 'https://curefusion2.runasp.net/api';

  constructor(private http: HttpClient) {}

  // --- Question Endpoints --- //

  getAllQuestions(pageNumber: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Question>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PaginatedResponse<Question>>(`${this.apiUrl}/Question/GetAll`, { params });
  }

  // Convenience method to get only the questions array
  getAllQuestionsItems(pageNumber: number = 1, pageSize: number = 10): Observable<Question[]> {
    return this.getAllQuestions(pageNumber, pageSize).pipe(
      map(response => response.items)
    );
  }

  getQuestionById(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/Question/GetAsync/${id}`);
  }

  createQuestion(questionData: CreateQuestionDto): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/Question/CreateAsync`, questionData);
  }

  updateQuestion(id: number, questionData: Partial<CreateQuestionDto>): Observable<any> {
    return this.http.put(`${this.apiUrl}/Question/UpdateAsync/${id}`, questionData);
  }

  deleteQuestion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Question/DeleteAsync/${id}`);
  }

  upVoteQuestion(questionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Question/UpVote/${questionId}`, {});
  }

  downVoteQuestion(questionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Question/DownVote/${questionId}`, {});
  }

  // --- Answer Endpoints --- //

  getAnswersForQuestion(questionId: number): Observable<Answer[]> {
    let params = new HttpParams().set('QuestionId', questionId.toString());
    return this.http.get<Answer[]>(`${this.apiUrl}/Answer`, { params });
  }

  createAnswer(answerData: CreateAnswerDto): Observable<Answer> {
    const body = { content: answerData.content };
    return this.http.post<Answer>(`${this.apiUrl}/Answer/Create/${answerData.questionId}`, body);  }

  updateAnswer(id: number, answerData: Partial<CreateAnswerDto>): Observable<any> {
    return this.http.put(`${this.apiUrl}/Answer/Update/${id}`, answerData);
  }

  deleteAnswer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Answer/Delete/${id}`);
  }

  upVoteAnswer(answerId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Answer/UpVote/${answerId}`, {});
  }

  downVoteAnswer(answerId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Answer/DownVote/${answerId}`, {});
  }
}