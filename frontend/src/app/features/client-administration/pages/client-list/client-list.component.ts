import { Component, OnInit } from '@angular/core';
import { Client } from '../../../../core/models/client.model';
import { ClientService } from '../../../../core/services/client.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  showInactive: boolean = false;

  constructor(
    private clientService: ClientService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.loadingService.setLoading(true, 'Se încarcă lista de clienți...');

    const params = { showInactive: this.showInactive };

    this.clientService.getAll(params).subscribe({
      next: (data) => {
        this.clients = data;
        this.applyFilters();
        this.loading = false;
        this.loadingService.setLoading(false);
      },
      error: (error) => {
        this.notificationService.showError('Eroare la încărcarea clienților: ' + error.message);
        this.loading = false;
        this.loadingService.setLoading(false);
      }
    });
  }

  applyFilters(): void {

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredClients = this.clients.filter(client =>
        client.last_name.toLowerCase().includes(searchLower) ||
        client.first_name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        (client.phone && client.phone.includes(this.searchTerm))
      );
    } else {
      this.filteredClients = [...this.clients];
    }
  }

  onSearch(): void {
    this.applyFilters();
  }

  toggleShowInactive(): void {
    this.showInactive = !this.showInactive;
    this.loadClients();
  }

  onActivateClient(id: number): void {
    this.loadingService.setLoading(true, 'Se activează clientul...');

    this.clientService.activate(id).subscribe({
      next: () => {
        const client = this.clients.find(c => c.id === id);
        if (client) {
          client.activ = true;
        }
        this.applyFilters();
        this.notificationService.showSuccess('Clientul a fost activat cu succes!');
        this.loadingService.setLoading(false);
      },
      error: (error) => {
        this.notificationService.showError('Eroare la activarea clientului: ' + error.message);
        this.loadingService.setLoading(false);
      }
    });
  }

  onDeactivateClient(id: number): void {
    this.loadingService.setLoading(true, 'Se dezactivează clientul...');

    this.clientService.deactivate(id).subscribe({
      next: () => {
        this.loadClients();
        this.notificationService.showSuccess('Clientul a fost dezactivat cu succes!');
        this.loadingService.setLoading(false);
      },
      error: (error) => {
        this.notificationService.showError('Eroare la dezactivarea clientului: ' + error.message);
        this.loadingService.setLoading(false);
      }
    });
  }

  onDeleteClient(id: number): void {
    if (confirm('Sunteți sigur că doriți să ștergeți acest client? Această acțiune nu poate fi anulată.')) {
      this.loadingService.setLoading(true, 'Se șterge clientul...');

      this.clientService.delete(id).subscribe({
        next: () => {
          this.loadClients();
          this.notificationService.showSuccess('Clientul a fost șters cu succes!');
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la ștergerea clientului: ' + error.message);
          this.loadingService.setLoading(false);
        }
      });
    }
  }
}
