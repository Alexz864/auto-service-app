import { Component, OnInit } from '@angular/core';
import { Part } from '../../../../core/models/part.model';
import { PartService } from '../../../../core/services/part.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-part-list',
  templateUrl: './part-list.component.html',
  styleUrls: ['./part-list.component.scss']
})
export class PartListComponent implements OnInit {
  parts: Part[] = [];
  filteredParts: Part[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  showInactive: boolean = false;
  showOutOfStock: boolean = false;

  constructor(
    private partService: PartService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadParts();
  }

  loadParts(): void {
    this.loading = true;
    this.loadingService.setLoading(true, 'Se încarcă lista de piese...');

    this.partService.getAll({ showInactive: this.showInactive }).subscribe({
      next: (data) => {
        this.parts = data;
        this.applyFilters();
        this.loading = false;
        this.loadingService.setLoading(false);
      },
      error: (error) => {
        this.notificationService.showError('Eroare la încărcarea pieselor: ' + error.message);
        this.loading = false;
        this.loadingService.setLoading(false);
      }
    });
  }

  applyFilters(): void {
    this.filteredParts = this.parts.filter(part => {

      if (!this.showInactive && !part.activa) {
        return false;
      }

      if (!this.showOutOfStock && part.stock <= 0) {
        return false;
      }

      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        return (
          part.name.toLowerCase().includes(searchLower) ||
          part.code.toLowerCase().includes(searchLower) ||
          part.description.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  toggleShowInactive(): void {
    this.showInactive = !this.showInactive;
    this.loadParts();
  }

  toggleShowOutOfStock(): void {
    this.showOutOfStock = !this.showOutOfStock;
    this.applyFilters();
  }

  onActivatePart(id: number): void {
    this.loadingService.setLoading(true, 'Se activează piesa...');

    this.partService.activate(id).subscribe({
      next: () => {
        const part = this.parts.find(p => p.id === id);
        if (part) {
          part.activa = true;
        }
        this.applyFilters();
        this.notificationService.showSuccess('Piesa a fost activată cu succes!');
        this.loadingService.setLoading(false);
      },
      error: (error) => {
        this.notificationService.showError('Eroare la activarea piesei: ' + error.message);
        this.loadingService.setLoading(false);
      }
    });
  }

  onDeactivatePart(id: number): void {
    this.loadingService.setLoading(true, 'Se dezactivează piesa...');

    this.partService.deactivate(id).subscribe({
      next: () => {
        const part = this.parts.find(p => p.id === id);
        if (part) {
          part.activa = false;
        }
        this.applyFilters();
        this.notificationService.showSuccess('Piesa a fost dezactivată cu succes!');
        this.loadingService.setLoading(false);
      },
      error: (error) => {
        this.notificationService.showError('Eroare la dezactivarea piesei: ' + error.message);
        this.loadingService.setLoading(false);
      }
    });
  }

  onUpdateStock(id: number, stock: number): void {
    const newStock = prompt('Introduceți cantitatea nouă:', stock.toString());
    if (newStock !== null) {
      const quantity = parseInt(newStock, 10);
      if (!isNaN(quantity) && quantity >= 0) {
        this.loadingService.setLoading(true, 'Se actualizează stocul...');

        this.partService.updateStock(id, quantity).subscribe({
          next: () => {
            const part = this.parts.find(p => p.id === id);
            if (part) {
              part.stock = quantity;
            }
            this.applyFilters();
            this.notificationService.showSuccess('Stocul a fost actualizat cu succes!');
            this.loadingService.setLoading(false);
          },
          error: (error) => {
            this.notificationService.showError('Eroare la actualizarea stocului: ' + error.message);
            this.loadingService.setLoading(false);
          }
        });
      } else {
        this.notificationService.showError('Cantitatea introdusă nu este validă!');
      }
    }
  }

  onDeletePart(id: number): void {
    if (confirm('Sunteți sigur că doriți să ștergeți această piesă? Această acțiune nu poate fi anulată.')) {
      this.loadingService.setLoading(true, 'Se șterge piesa...');

      this.partService.delete(id).subscribe({
        next: () => {
          this.parts = this.parts.filter(p => p.id !== id);
          this.applyFilters();
          this.notificationService.showSuccess('Piesa a fost ștearsă cu succes!');
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la ștergerea piesei: ' + error.message);
          this.loadingService.setLoading(false);
        }
      });
    }
  }
}
