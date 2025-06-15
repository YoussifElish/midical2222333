import { FormGroup, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HospitalService, Hospital } from '../../../shared/services/hospital.service';

@Component({
  selector: 'app-hospital',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './hospital.component.html',
  styleUrl: './hospital.component.css'
})
export class HospitalComponent implements OnInit {
  HospitalForm: FormGroup = new FormGroup({
    SearchInput: new FormControl('', [Validators.required])
  });

  hospitals: Hospital[] = [];
  isLoading = false;
  errorMessage = '';
  currentLocation = '';
  showResults = false;

  constructor(private hospitalService: HospitalService) {}

  ngOnInit() {
    this.getCurrentLocationName();
  }

  
  async getCurrentLocationName() {
    try {
      const position = await this.hospitalService.getCurrentLocation();
      const { latitude, longitude } = position.coords;
      
      this.hospitalService.reverseGeocode(latitude, longitude).subscribe({
        next: (result) => {
          if (result && result.address) {
            const city = result.address.city || result.address.town || result.address.village || result.address.state;
            if (city) {
              this.currentLocation = city;
              this.HospitalForm.get('SearchInput')?.setValue(city);
            }
          }
        },
        error: (error) => {
          console.error('Error getting location name:', error);
        }
      });
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  }

  /**
   * البحث عن المستشفيات القريبة
   */
  searchNearbyHospitals(searchValue?: string) {
    const zone = searchValue || this.HospitalForm.get('SearchInput')?.value;
    
    if (!zone || zone.trim() === '') {
      this.showResults = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.showResults = true;

    this.hospitalService.searchNearbyHospitals(zone.trim()).subscribe({
      next: (response) => {
        this.hospitals = response.data || [];
        this.isLoading = false;
        
        if (this.hospitals.length === 0) {
          this.errorMessage = 'No hospitals found in this area';
        }
      },
      error: (error) => {
        console.error('Error searching hospitals:', error);
        this.isLoading = false;
        this.errorMessage = 'An error occurred while searching for hospitals.';
      }
    });
  }

  /**
   * إخفاء نتائج البحث
   */
  hideResults() {
    setTimeout(() => {
      this.showResults = false;
    }, 200);
  }

  /**
   * اختيار مستشفى من النتائج
   */
  selectHospital(hospital: Hospital) {
    console.log('Selected hospital:', hospital);
    // يمكن إضافة المزيد من الوظائف هنا مثل عرض تفاصيل المستشفى أو التوجيه إليه
    this.showResults = false;
  }

  /**
   * تتبع المستشفيات لتحسين الأداء
   */
  trackByHospitalId(index: number, hospital: Hospital): string {
    return hospital.id;
  }

  /**
   * فتح الموقع في خرائط جوجل
   */
  openInGoogleMaps(hospital: Hospital) {
    const url = `https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`;
    window.open(url, '_blank');
  }

  /**
   * معالج حدث الإدخال
   */
  onInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchNearbyHospitals(target.value);
  }

  /**
   * فتح موقع المستشفى الإلكتروني
   */
  openWebsite(website: string) {
    window.open(website, '_blank');
  }
}
