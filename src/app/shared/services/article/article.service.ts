import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../base/Environment';

// Define a more detailed interface for Article based on potential API response
export interface Article {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[]; // Changed from string to string[] based on API usage
  category?: number;
  authorName?: string;
  authorId?: string;
  summary: string;
  publishedDate: Date | string;
}

// Interface for pagination/filter parameters
export interface ArticleParams {
  pageNumber?: number;
  pageSize?: number;
  category?: number;
  searchTerm?: string;
  tag?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

// Interface for CreateArticleRequest query parameters
export interface CreateArticleQueryParams {
  Title: string;
  Summary: string;
  Category: number;
  Tags?: string;
  authorId: string;
}

// Interface for UpdateArticleRequest query parameters
export interface UpdateArticleQueryParams {
  id: number;
  Title: string;
  Summary: string;
  Category: number;
  Tags?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  constructor(private http: HttpClient) { }

  getAllArticles(params?: ArticleParams): Observable<Article[]> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value != null) {
          // Adjust key casing if needed by API, assuming PascalCase based on other examples
          const paramKey = key.charAt(0).toUpperCase() + key.slice(1);
          httpParams = httpParams.set(paramKey, value.toString());
        }
      });
    }

    return this.http.get<Article[]>(`${Environment.baseurl}/Article/GetAll`, { params: httpParams });
  }

  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(`${Environment.baseurl}/Article/${id}`);
  }

  // Updated addArticle method
  addArticle(queryParams: CreateArticleQueryParams, formData: FormData): Observable<Article> {
    let httpParams = new HttpParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value != null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    // Send query parameters in params and FormData in the body
    return this.http.post<Article>(`${Environment.baseurl}/Article/Add`, formData, { params: httpParams });
  }

  // Updated updateArticle method
  updateArticle(queryParams: UpdateArticleQueryParams, formData: FormData): Observable<Article> {
    let httpParams = new HttpParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value != null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    // Correct endpoint and send query parameters in params, FormData in the body
    return this.http.put<Article>(`${Environment.baseurl}/Article`, formData, { params: httpParams });
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${Environment.baseurl}/Article/${id}`);
  }
}

