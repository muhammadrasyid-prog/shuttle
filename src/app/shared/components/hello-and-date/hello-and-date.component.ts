import { Component } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-hello-and-date',
  standalone: true,
  imports: [LottieComponent],
  templateUrl: './hello-and-date.component.html',
  styleUrl: './hello-and-date.component.css'
})
export class HelloAndDateComponent {
  options: AnimationOptions = {
    path: '../../../../assets/lottie/anim_sa/anim_dashboard.json',
  };

  animationCreated(animationItem: AnimationItem): void {
    console.log(animationItem);
  }
}
