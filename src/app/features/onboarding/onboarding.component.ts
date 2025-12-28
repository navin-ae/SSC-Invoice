import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { seedSampleData } from '../../core/utils/sample-data';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent {
  public step = 1;

  public next() {
    this.step = Math.min(3, this.step + 1);
  }

  public prev() {
    this.step = Math.max(1, this.step - 1);
  }

  public finish(withSample = false) {
    if (withSample) seedSampleData(30);
    localStorage.setItem('ssc_onboarded_v1', '1');
    const evt = new CustomEvent('onboarding:finished');
    window.dispatchEvent(evt);
  }
}
