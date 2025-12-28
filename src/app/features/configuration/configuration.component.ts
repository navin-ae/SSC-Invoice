import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { exportAllData, importAllData } from '../../core/utils/backup';
import { CustomersComponent } from '../customers/customers.component';
import { ProductsComponent } from '../products/products.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [CommonModule, CustomersComponent, ProductsComponent,MatButtonModule],
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent implements AfterViewInit {
  public ngAfterViewInit(): void {
    const exportBtn = document.getElementById('exportBtn');
    const restoreBtn = document.getElementById('restoreBtn');
    const restoreFile = document.getElementById('restoreFile') as HTMLInputElement | null;
    if (exportBtn)
      exportBtn.addEventListener('click', () => {
        const data = exportAllData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ssc-backup-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    if (restoreBtn && restoreFile)
      restoreBtn.addEventListener('click', async () => {
        if (!restoreFile.files || !restoreFile.files.length) return alert('Select a backup file');
        const f = restoreFile.files[0];
        const txt = await f.text();
        const ok = await importAllData(txt);
        if (ok) {
          alert('Restore completed. Please reload the app to refresh data.');
        } else {
          alert('Restore failed. Check console for details.');
        }
      });
  }
}
