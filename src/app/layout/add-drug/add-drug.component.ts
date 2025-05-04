import { DrugService } from './../../shared/services/drug/drug.service';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
 import { Router } from '@angular/router';

@Component({
  selector: 'app-add-drug',
  standalone: true,
  imports: [ReactiveFormsModule,],
  templateUrl: './add-drug.component.html',
  styleUrl: './add-drug.component.css'
})
export class AddDrugComponent {
spinner:boolean=false;
errormsg!:string
  addDrugForm:FormGroup = new FormGroup({
 
    Dosage:new FormControl(null, Validators.required),
    Name:new FormControl(null, Validators.required),
    SideEffect:new FormControl(null, Validators.required),
    Interaction:new FormControl(null, Validators.required),
    Description:new FormControl(null,Validators.required) ,
    Image:new FormControl(null,Validators.required) ,
  

  } )
  
  constructor(private _DrugService:DrugService, private  _Router:Router){}
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.addDrugForm.patchValue({ Image: file });
    }
  }
  
  PostDrug() {
    this.spinner = true;
  
    if (this.addDrugForm.valid) {
      const formData = new FormData();
      formData.append('Dosage', this.addDrugForm.get('Dosage')?.value);
      formData.append('Name', this.addDrugForm.get('Name')?.value);
      formData.append('SideEffect', this.addDrugForm.get('SideEffect')?.value);
      formData.append('Interaction', this.addDrugForm.get('Interaction')?.value);
      formData.append('Description', this.addDrugForm.get('Description')?.value);
  
      // 👇 أهم حاجة هنا
      const imageFile = this.addDrugForm.get('Image')?.value;
      if (imageFile instanceof File) {
        formData.append('Image', imageFile);
      }
  
      this._DrugService.addDrug(formData).subscribe({
        next: (res) => {
          this.spinner = false;
          this._Router.navigate(['/Medicines']);
        },
        error: (err) => {
          this.spinner = false;
          this.errormsg = err.error.errors?.[0]?.description || 'Error occurred';
        }
      });
    }
  }
  

  } 