import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppointmentService } from '../../../shared/services/appointment.service';
import { FormsModule } from '@angular/forms';
import { CalendarModule, CalendarView, CalendarEvent, CalendarEventTimesChangedEvent, CalendarMonthViewDay } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { addHours, isSameDay, isSameMonth } from 'date-fns';

interface MyCalendarEvent extends CalendarEvent {
  appointmentDetails?: any;
}

@Component({
  selector: 'app-patient-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule],
  templateUrl: './patient-appointment.component.html',
  styleUrls: ['./patient-appointment.component.css'],
})
export class patientAppointmentsComponent implements OnInit, OnDestroy {
  @ViewChild('modalContent', { static: true }) modalContent?: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  activeDayIsOpen: boolean = false;

  events: MyCalendarEvent[] = [];
  availableTimeSlots: MyCalendarEvent[] = [];
  selectedDateForSlots: Date | null = null;

  doctorId: number | null = null;
  doctorName: string | null = null;

  isLoading = true;
  error: string | null = null;
  bookingError: string | null = null;
  isBooking = false;
  selectedAppointmentId: number | null = null;
  selectedEventForBooking: MyCalendarEvent | null = null;
  notes: string = '';

  private routeSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.doctorId = +id;
      } else {
        this.error = 'Doctor ID not found in route.';
        this.isLoading = false;
        console.error('Missing doctor ID in route parameters.');
        return;
      }

      this.doctorName = localStorage.getItem('doctorName') || null;
      if (!this.doctorName) {
        console.warn('Doctor name not provided.');
      }

      console.log('Received:', { doctorId: this.doctorId, doctorName: this.doctorName });
      this.loadAppointmentsAndSetupCalendar();
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  goBack(): void {
    localStorage.removeItem('doctorName');
    this.router.navigate(['/doctors']);
  }

  loadAppointmentsAndSetupCalendar(): void {
    if (!this.doctorId) return;

    this.isLoading = true;
    this.error = null;
    console.log('[DEBUG] Starting to load appointments for doctor ID:', this.doctorId);

    this.appointmentService.getActiveAppointmentsByDoctorId(this.doctorId).subscribe({
      next: (response) => {
        const rawAppointments = response.data || response;
        console.log('[DEBUG] Raw appointments received from service:', JSON.stringify(rawAppointments, null, 2));

        if (!Array.isArray(rawAppointments)) {
          console.error('[DEBUG] Raw appointments is not an array:', rawAppointments);
          this.events = [];
        } else {
          this.events = rawAppointments.map((appt: any, index: number) => {
            console.log(`[DEBUG] Mapping appointment ${index + 1} (raw):`, JSON.stringify(appt, null, 2));
            const start = new Date(appt.appointmentDate);
            const duration = typeof appt.durationInMinutes === 'number' && appt.durationInMinutes > 0 ? appt.durationInMinutes : 30;
            const end = addHours(start, duration / 60);

            const eventTitle = `Slot at ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

            const currentStatus = appt.status ? String(appt.status).trim().toLowerCase() : 'available';
            console.log(`[DEBUG] Appointment ${index + 1} - Start: ${start}, End: ${end}, Title: ${eventTitle}, Original Status: '${appt.status}', Processed Status: '${currentStatus}'`);

            return {
              start,
              end,
              title: eventTitle,
              color: { primary: '#1e90ff', secondary: '#D1E8FF' },
              resizable: { beforeStart: false, afterEnd: false },
              draggable: false,
              appointmentDetails: { ...appt, status: currentStatus },
            };
          });
        }

        this.isLoading = false;
        console.log(`[DEBUG] Appointments transformed for calendar for doctor ${this.doctorId}:`, JSON.stringify(this.events.map((e) => ({ title: e.title, start: e.start, end: e.end, status: e.appointmentDetails?.status })), null, 2));

        if (this.events.length === 0) {
          this.error = 'No available appointments found for this doctor.';
          console.log('[DEBUG] No events created for the calendar.');
        }
      },
      error: (err) => {
        console.error(`[DEBUG] Error loading appointments for doctor ${this.doctorId}:`, err);
        this.error = 'Failed to load appointments. Please try again later.';
        if (err.error instanceof ErrorEvent) {
          this.error += ` Details: ${err.error.message}`;
        } else {
          this.error += ` Status: ${err.status}, Body: ${JSON.stringify(err.error)}`;
        }
        this.isLoading = false;
      },
    });
  }

  dayClicked({ day }: { day: CalendarMonthViewDay }): void {
    const date = day.date;
    const eventsOnThisDay = day.events as MyCalendarEvent[];
    console.log('[DEBUG] dayClicked - Date:', date);
    console.log('[DEBUG] dayClicked - Events on this day (from day.events before filtering):', JSON.stringify(eventsOnThisDay.map((e) => ({ title: e.title, start: e.start, end: e.end, status: e.appointmentDetails?.status })), null, 2));

    if (isSameMonth(date, this.viewDate)) {
      if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || eventsOnThisDay.length === 0) {
        console.log('[DEBUG] dayClicked - Closing day view or day has no events.');
        this.activeDayIsOpen = false;
        this.availableTimeSlots = [];
        this.selectedDateForSlots = null;
        this.error = null;
      } else {
        console.log('[DEBUG] dayClicked - Opening day view.');
        this.activeDayIsOpen = true;
        this.viewDate = date;
        this.selectedDateForSlots = date;

        this.availableTimeSlots = eventsOnThisDay.filter((event) => {
          const status = event.appointmentDetails?.status;
          const isAvailable = typeof status === 'string' && status.trim().toLowerCase() === 'available';
          console.log(`[DEBUG] dayClicked - Filtering event: Title: ${event.title}, Status from event.appointmentDetails: '${status}', IsAvailableCheck: ${isAvailable}`);
          return isAvailable;
        });

        console.log('[DEBUG] dayClicked - Filtered availableTimeSlots (after checking status "available"):', JSON.stringify(this.availableTimeSlots.map((e) => ({ title: e.title, start: e.start, end: e.end, status: e.appointmentDetails?.status })), null, 2));

        if (this.availableTimeSlots.length === 0) {
          this.error = 'No available time slots for this specific day. Please check another day.';
          console.log('[DEBUG] dayClicked - No available slots found after filtering for date:', date);
        } else {
          this.error = null;
        }
      }
    } else {
      console.log('[DEBUG] dayClicked - Clicked on a day in a different month.');
      this.activeDayIsOpen = false;
      this.availableTimeSlots = [];
      this.selectedDateForSlots = null;
      this.error = null;
    }
  }

  eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return { ...event, start: newStart, end: newEnd };
      }
      return iEvent;
    });
  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log('[DEBUG] handleEvent - Action:', action, 'Event:', event);
    const myEvent = event as MyCalendarEvent;
    if (myEvent.appointmentDetails && myEvent.appointmentDetails.status?.trim().toLowerCase() === 'available') {
      this.selectAppointmentForBooking(myEvent);
    }
  }

  selectAppointmentForBooking(slotEvent: MyCalendarEvent): void {
    this.selectedEventForBooking = slotEvent;
    this.selectedAppointmentId = slotEvent.appointmentDetails.id;
    this.bookingError = null;
    console.log('[DEBUG] selectAppointmentForBooking - Selected event:', JSON.stringify(this.selectedEventForBooking, null, 2));
  }

  proceedToPayment(): void {
    if (!this.selectedAppointmentId || !this.selectedEventForBooking) {
      this.bookingError = 'Please select an appointment time slot from the list first.';
      return;
    }

    this.isBooking = true;
    this.bookingError = null;

    this.appointmentService.bookAppointment(this.selectedAppointmentId, this.notes).subscribe({
      next: (response) => {
        console.log('Booking successful:', response);
        const paymentUrl = response.paymentUrl || response.data?.paymentUrl;
        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          console.error('Payment link not found in booking response:', response);
          this.bookingError = 'Booking confirmed, but failed to retrieve payment link. Please contact support.';
          this.isBooking = false;
        }
      },
      error: (err) => {
        console.error('Error booking appointment:', err);
        this.bookingError = 'Failed to book appointment. Please try again.';
        if (err.error instanceof ErrorEvent) {
          this.bookingError += ` Details: ${err.error.message}`;
        } else {
          this.bookingError += ` Status: ${err.status}, Body: ${JSON.stringify(err.error)}`;
        }
        this.isBooking = false;
      },
    });
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
    this.availableTimeSlots = [];
    this.selectedDateForSlots = null;
    this.error = null;
  }
}