import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../../../../core/models/client.model';
import { ClientService } from '../../../../core/services/client.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.scss']
})
export class AddClientComponent implements OnInit {
  client: Client | null = null;
  loading: boolean = false;
  isEditMode: boolean = false;
  clientId: number | null = null;

  constructor(
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clientId = +id;
      this.isEditMode = true;
      this.loadClient();
    }
  }

  loadClient(): void {
    if (this.clientId) {
      this.loading = true;
      this.loadingService.setLoading(true, 'Se încarcă datele clientului...');

      this.clientService.getById(this.clientId).subscribe({
        next: (data) => {
          this.client = data;
          this.loading = false;
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la încărcarea clientului: ' + error.message);
          this.loading = false;
          this.loadingService.setLoading(false);
          this.router.navigate(['/clients']);
        }
      });
    }
  }

  onSubmit(clientData: Client): void {
    this.loading = true;
    this.loadingService.setLoading(true, this.isEditMode ? 'Se actualizează clientul...' : 'Se adaugă clientul...');

    const updatedClientData: Client = {
      ...clientData,
      activ: Boolean(clientData.activ)
    };

    if (this.isEditMode && this.clientId) {
      this.clientService.update(this.clientId, clientData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Clientul a fost actualizat cu succes!');
          this.loading = false;
          this.loadingService.setLoading(false);
          this.router.navigate(['/clients']);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la actualizarea clientului: ' + error.message);
          this.loading = false;
          this.loadingService.setLoading(false);
        }
      });
    } else {
      this.clientService.create(updatedClientData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Clientul a fost adăugat cu succes!');
          this.loading = false;
          this.loadingService.setLoading(false);
          this.router.navigate(['/clients']);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la adăugarea clientului: ' + error.message);
          this.loading = false;
          this.loadingService.setLoading(false);
        }
      });
    }
  }
}
