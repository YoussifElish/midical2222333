import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  rating?: number;
  distance?: number;
}

export interface HospitalResponse {
  data: Hospital[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class HospitalService {
  private readonly API_BASE_URL = 'https://curefusion2.runasp.net/api';

  constructor(private http: HttpClient) { }

  /**
   * البحث عن المستشفيات القريبة باستخدام اسم المنطقة
   * @param zone اسم المنطقة أو المدينة
   * @param radius نصف القطر بالمتر (افتراضي: 5000)
   * @param pageNumber رقم الصفحة (افتراضي: 1)
   * @param pageSize حجم الصفحة (افتراضي: 10)
   * @returns Observable<HospitalResponse>
   */
  searchNearbyHospitals(
    zone: string, 
    radius: number = 5000, 
    pageNumber: number = 1, 
    pageSize: number = 10
  ): Observable<HospitalResponse> {
    const params = new HttpParams()
      .set('zone', zone)
      .set('radius', radius.toString())
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<HospitalResponse>(`${this.API_BASE_URL}/Hospital/nearby`, { params });
  }

  /**
   * الحصول على الموقع الحالي للمستخدم
   * @returns Promise<GeolocationPosition>
   */
  getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  /**
   * تحويل الإحداثيات إلى اسم المنطقة باستخدام Nominatim API
   * @param lat خط العرض
   * @param lng خط الطول
   * @returns Observable<any>
   */
  reverseGeocode(lat: number, lng: number): Observable<any> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
    return this.http.get(url);
  }
}

