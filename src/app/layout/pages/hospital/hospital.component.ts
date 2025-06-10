import { FormGroup, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  selector: 'app-hospital',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './hospital.component.html',
  styleUrl: './hospital.component.css'
})
export class HospitalComponent {
HospitalForm:FormGroup=new FormGroup({

  SearchInput:new FormControl([null,Validators.required])

 
})

}
