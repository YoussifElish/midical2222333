import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugReminderComponent } from './drug-reminder.component';

describe('DrugReminderComponent', () => {
  let component: DrugReminderComponent;
  let fixture: ComponentFixture<DrugReminderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrugReminderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DrugReminderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
