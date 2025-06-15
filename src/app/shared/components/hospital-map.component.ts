import { Component, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Hospital } from '../../shared/services/hospital.service';

@Component({
  selector: 'app-hospital-map',
  standalone: true,
  template: `<div id="hospitalMap" style="height: 400px; width: 100%; border-radius: 8px;"></div>`,
  styleUrls: []
})
export class HospitalMapComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() hospitals: Hospital[] = [];
  @Input() userLocation: { lat: number; lng: number } | null = null;

  private map: any;
  private L: any;
  private markersLayer: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.L = await import('leaflet');
        if (this.L?.Icon?.Default) {
          delete (this.L.Icon.Default.prototype as any)._getIconUrl;
          this.L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/assets/marker-icon-2x.png',
            iconUrl: '/assets/marker-icon.png',
            shadowUrl: '/assets/marker-shadow.png',
          });
        }
      } catch (error) {
        console.warn('Leaflet import failed:', error);
      }
    }
  }

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(async () => {
        await this.initMap();
      }, 0); // Ensure DOM is ready
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (isPlatformBrowser(this.platformId) && this.map) {
      if (changes['hospitals']) {
        this.updateHospitalMarkers();
      }
      if (changes['userLocation'] && this.userLocation) {
        this.addUserLocationMarker();
      }
    }
  }

  private async initMap() {
    if (!isPlatformBrowser(this.platformId) || !document.getElementById('hospitalMap')) {
      console.warn('Cannot initialize map: Not in browser or DOM element missing');
      return;
    }

    if (!this.L) {
      console.log('Leaflet not loaded, importing...');
      this.L = await import('leaflet');
    }

    console.log('Leaflet:', this.L);
    const L = this.L;
    const defaultCenter: [number, number] = [30.0444, 31.2357];
    this.map = L.map('hospitalMap').setView(defaultCenter, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);

    if (this.hospitals.length > 0) {
      this.updateHospitalMarkers();
    }

    if (this.userLocation) {
      this.addUserLocationMarker();
    }
  }

  private updateHospitalMarkers() {
    if (!isPlatformBrowser(this.platformId) || !this.L || !this.markersLayer) return;

    this.markersLayer.clearLayers();

    const hospitalIcon = this.L.divIcon({
      html: '<i class="fas fa-hospital" style="color: #dc3545; font-size: 20px;"></i>',
      iconSize: [25, 25],
      className: 'custom-div-icon'
    });

    if (!Array.isArray(this.hospitals)) {
      console.warn('hospitals is not an array:', this.hospitals);
      return;
    }

    this.hospitals.forEach(hospital => {
      const marker = this.L.marker(
        [hospital.location.latitude, hospital.location.longitude],
        { icon: hospitalIcon }
      );

      const popupContent = `...`; // Your existing popup content
      marker.bindPopup(popupContent);
      this.markersLayer.addLayer(marker);
    });

    const layers = this.markersLayer?.getLayers?.();
    if (Array.isArray(layers) && layers.length > 0) {
      const group = this.L.featureGroup(layers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    } else {
      console.warn('No valid layers to fit bounds:', layers);
    }
  }

  private addUserLocationMarker() {
    if (!isPlatformBrowser(this.platformId) || !this.L || !this.userLocation) return;

    const userIcon = this.L.divIcon({
      html: '<i class="fas fa-user-circle" style="color: #28a745; font-size: 20px;"></i>',
      iconSize: [25, 25],
      className: 'custom-div-icon'
    });

    const userMarker = this.L.marker(
      [this.userLocation.lat, this.userLocation.lng],
      { icon: userIcon }
    );

    userMarker.bindPopup(`
      <div style="text-align: center;">
        <h6 style="color: #28a745;">
          <i class="fas fa-user-circle me-2"></i>موقعك الحالي
        </h6>
      </div>
    `);

    this.markersLayer.addLayer(userMarker);
  }

  centerOnUserLocation() {
    if (isPlatformBrowser(this.platformId) && this.userLocation && this.map) {
      this.map.setView([this.userLocation.lat, this.userLocation.lng], 14);
    }
  }

  fitAllMarkers() {
    if (isPlatformBrowser(this.platformId) && this.markersLayer?.getLayers().length > 0) {
      const group = this.L.featureGroup(this.markersLayer.getLayers());
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }
}