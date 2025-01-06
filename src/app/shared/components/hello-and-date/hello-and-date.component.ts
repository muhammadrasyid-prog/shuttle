import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnimationItem } from 'lottie-web';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

interface TimeData {
  dayName: string;
  dayDate: string;
  monthName: string;
  year: string;
  hours: number;
  minutes: number;
  seconds: number;
  ampm: string;
}

@Component({
  selector: 'app-hello-and-date',
  standalone: true,
  imports: [LottieComponent],
  templateUrl: './hello-and-date.component.html',
  styleUrl: './hello-and-date.component.css'
})
export class HelloAndDateComponent implements OnInit {

  private clockSubscription!: Subscription;
  
  hourHandRotation: string = '';
  minuteHandRotation: string = '';
  secondHandRotation: string = '';
  digitalTime: string = '';
  dateInfo: string = '';
  timezone: string = '';

  private readonly daysIndo = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  private readonly monthsIndo = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  ngOnInit() {
    // Set timezone info
    this.timezone = `Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;

    // Create an observable that emits every second
    this.clockSubscription = interval(1000)
      .pipe(
        map(() => this.getTimeData(new Date()))
      )
      .subscribe(timeData => {
        this.updateClockHands(timeData);
        this.updateDisplays(timeData);
      });
  }

  ngOnDestroy() {
    if (this.clockSubscription) {
      this.clockSubscription.unsubscribe();
    }
  }

  private getTimeData(date: Date): TimeData {
    return {
      dayName: this.daysIndo[date.getDay()],
      dayDate: date.getDate().toString(),
      monthName: this.monthsIndo[date.getMonth()],
      year: date.getFullYear().toString(),
      hours: date.getHours(),
      minutes: date.getMinutes(),
      seconds: date.getSeconds(),
      ampm: date.getHours() >= 12 ? 'PM' : 'AM'
    };
  }

  private updateClockHands(timeData: TimeData) {
    const hours = timeData.hours % 12;
    const minutes = timeData.minutes;
    const seconds = timeData.seconds;

    // Calculate rotation angles
    const hourAngle = (hours * 30) + (minutes * 0.5);
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    this.hourHandRotation = `translate(-50%, -100%) rotate(${hourAngle}deg)`;
    this.minuteHandRotation = `translate(-50%, -100%) rotate(${minuteAngle}deg)`;
    this.secondHandRotation = `translate(-50%, -80%) rotate(${secondAngle}deg)`;
  }

  private updateDisplays(timeData: TimeData) {
    // Update digital time
    const displayHours = timeData.hours % 12 || 12;
    const paddedHours = displayHours.toString().padStart(2, '0');
    const paddedMinutes = timeData.minutes.toString().padStart(2, '0');
    const paddedSeconds = timeData.seconds.toString().padStart(2, '0');
    
    this.digitalTime = `${paddedHours}:${paddedMinutes}:${paddedSeconds} ${timeData.ampm}`;
    
    // Update date info
    this.dateInfo = `${timeData.dayName}, ${timeData.dayDate} ${timeData.monthName} ${timeData.year}`;
  }

  // Helper method untuk format angka dengan leading zero
  private padNumber(num: number): string {
    return num.toString().padStart(2, '0');
  }

  options: AnimationOptions = {
    path: '../../../../assets/lottie/anim_sa/anim_dashboard.json',
  };

  animationCreated(animationItem: AnimationItem): void {
    console.log(animationItem);
  }
}
