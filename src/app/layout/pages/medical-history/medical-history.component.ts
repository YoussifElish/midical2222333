import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MedicalRecord {
  id: string;
  date: string;
  doctorName: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  medications: string[];
}

@Component({
  selector: 'app-medical-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './medical-history.component.html',
  styleUrls: ['./medical-history.component.css']
})
export class MedicalHistoryComponent implements OnInit {
  patientId: string = '';
  patientName: string = '';
  loading = true;
  error: string | null = null;
  medicalRecords: MedicalRecord[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = params['id'];
      this.patientName = params['name'] || 'Unknown Patient';
      if (this.patientId) {
        this.loadMedicalHistory();
      }
    });
  }

  loadMedicalHistory(): void {
    this.loading = true;
    
    // Simulate API call - replace with actual service call
    setTimeout(() => {
      this.medicalRecords = [
        {
          id: '1',
          date: '2024-06-10',
          doctorName: 'Dr. Ahmed Hassan',
          diagnosis: 'Hypertension',
          treatment: 'Lifestyle changes and medication',
          notes: 'Patient shows good response to treatment. Blood pressure stable.',
          medications: ['Lisinopril 10mg', 'Hydrochlorothiazide 25mg']
        },
        {
          id: '2',
          date: '2024-05-15',
          doctorName: 'Dr. Sarah Mohamed',
          diagnosis: 'Type 2 Diabetes',
          treatment: 'Diet modification and Metformin',
          notes: 'HbA1c levels improved. Continue current treatment plan.',
          medications: ['Metformin 500mg', 'Glipizide 5mg']
        },
        {
          id: '3',
          date: '2024-04-20',
          doctorName: 'Dr. Omar Ali',
          diagnosis: 'Seasonal Allergies',
          treatment: 'Antihistamines and nasal spray',
          notes: 'Symptoms well controlled with current medication.',
          medications: ['Cetirizine 10mg', 'Fluticasone nasal spray']
        }
      ];
      this.loading = false;
    }, 1000);
  }

  goBack(): void {
    this.router.navigate(['/admin/patients']);
  }
}

