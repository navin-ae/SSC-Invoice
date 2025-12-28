import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { OnboardingComponent } from './features/onboarding/onboarding.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, OnboardingComponent, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  public showOnboarding = signal<boolean>(localStorage.getItem('ssc_onboarded_v1') ? false : true);

  constructor() {
    window.addEventListener('onboarding:finished', () => this.showOnboarding.set(false));
  }
}
