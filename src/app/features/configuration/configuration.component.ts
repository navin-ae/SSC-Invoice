import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { exportAllData, importAllData } from '../../core/utils/backup';
import { CustomerGroupsComponent } from './customer-groups.component';

@Component({
  standalone: true,
  imports: [CommonModule, CustomerGroupsComponent],
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent {
  public isExporting = signal(false);
  public isRestoring = signal(false);
  public statusMessage = signal('');

  public async onExportBackup(): Promise<void> {
    try {
      this.isExporting.set(true);
      const data = await exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `raajamani-store-backup-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showMessage('Backup downloaded successfully! Save this file in a safe folder or pendrive.');
    } catch (err: any) {
      alert('Failed to export backup: ' + (err?.message || err));
    } finally {
      this.isExporting.set(false);
    }
  }

  public async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!confirm(`Restore data from "${file.name}"? This will update your store records.`)) {
      input.value = '';
      return;
    }

    try {
      this.isRestoring.set(true);
      const text = await file.text();
      const ok = await importAllData(text);
      if (ok) {
        this.showMessage('Store data restored successfully! All customer, product, and billing records are loaded.');
      } else {
        alert('Restore failed. Please verify that this is a valid JSON store backup file.');
      }
    } catch (err: any) {
      alert('Error reading backup file: ' + (err?.message || err));
    } finally {
      this.isRestoring.set(false);
      input.value = '';
    }
  }

  private showMessage(msg: string) {
    this.statusMessage.set(msg);
    setTimeout(() => this.statusMessage.set(''), 6000);
  }
}
