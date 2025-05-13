import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent {
  slides = [
    { image: './../../../../assets/images/try2.jpg', alt: 'Slide 1' },
    { image: './../../../../assets/images/try2.jpg', alt: 'Slide 2' },
    { image: './../../../../assets/images/try2.jpg', alt: 'Slide 3' }
  ];

  carouselOptions: OwlOptions = {
    items: 1,
    nav: true,
    dots: true,
    loop: true,
    autoplay: true,
    autoplayTimeout: 5000,
    responsive: {
      0: { items: 1 },
      600: { items: 1 },
      1000: { items: 1 }
    }
  };
}
