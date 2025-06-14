import { Component, OnInit } from '@angular/core';
import { AdminService, DashboardStats } from '../../../shared/services/admin';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  dashboardStats: DashboardStats | null = null;
  loading = true;
  error: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.loading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load dashboard statistics';
        this.loading = false;
        console.error('Error loading dashboard stats:', error);
      }
    });
  }

  refreshStats(): void {
    this.error = null;
    this.loadDashboardStats();
  }
}

