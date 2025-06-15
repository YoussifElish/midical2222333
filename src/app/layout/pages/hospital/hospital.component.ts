import { FormGroup, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild, ElementRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HospitalService, Hospital } from '../../../shared/services/hospital.service';
import { HospitalMapComponent } from '../../../shared/components/hospital-map.component';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-hospital',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HospitalMapComponent],
  templateUrl: './hospital.component.html',
  styleUrl: './hospital.component.css'
})
export class HospitalComponent implements OnInit {
  @ViewChild(HospitalMapComponent) mapComponent!: HospitalMapComponent;
  isBrowser = isPlatformBrowser(this.platformId);

  HospitalForm: FormGroup = new FormGroup({
    SearchInput: new FormControl('', [Validators.required])
  });

  hospitals: Hospital[] = [];
  isLoading = false;
  errorMessage = '';
  currentLocation = '';
  showResults = false;
  userLocation: { lat: number; lng: number } | null = null;

constructor(
    private hospitalService: HospitalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  ngOnInit() {
    this.getCurrentLocationName();
    
  }

  
  async getCurrentLocationName() {
    try {
      const position = await this.hospitalService.getCurrentLocation();
      const { latitude, longitude } = position.coords;
      
      // Store user location for map
      this.userLocation = { lat: latitude, lng: longitude };
      
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
        this.hospitals = response.items || [];
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
    return hospital.name + hospital.zone;
  }

  /**
   * فتح الموقع في خرائط جوجل
   */
  openInGoogleMaps(hospital: Hospital) {
    const url = `https://www.google.com/maps/search/?api=1&query=${hospital.location.latitude},${hospital.location.longitude}`;
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
   * التوسيط على الموقع الحالي في الخريطة
   */
  centerMapOnUserLocation() {
    if (this.mapComponent) {
      this.mapComponent.centerOnUserLocation();
    }
  }

  /**
   * إظهار جميع المستشفيات في الخريطة
   */
  fitAllMarkersInMap() {
    if (this.mapComponent) {
      this.mapComponent.fitAllMarkers();
    }
  }
}
