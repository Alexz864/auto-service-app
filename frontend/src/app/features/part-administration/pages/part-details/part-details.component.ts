import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Part } from '../../../../core/models/part.model';
import { PartService } from '../../../../core/services/part.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-part-details',
  templateUrl: './part-details.component.html',
  styleUrls: ['./part-details.component.scss']
})
export class PartDetailsComponent implements OnInit {
  part: Part | null = null;
  loading: boolean = false;
  partId: number | null = null;

  constructor(
    private partService: PartService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.partId = +id;
      this.loadPartDetails();
    } else {
      this.router.navigate(['/parts']);
    }
  }

  loadPartDetails(): void {
    if (this.partId) {
      this.loading = true;
      this.loadingService.setLoading(true, 'Se încarcă detaliile piesei...');

      this.partService.getById(this.partId).subscribe({
        next: (data) => {
          this.part = data;
          this.loading = false;
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la încărcarea detaliilor piesei: ' + error.message);
          this.loading = false;
          this.loadingService.setLoading(false);
          this.router.navigate(['/parts']);
        }
      });
    }
  }

  onActivatePart(): void {
    if (this.partId) {
      this.loadingService.setLoading(true, 'Se activează piesa...');

      this.partService.activate(this.partId).subscribe({
        next: () => {
          if (this.part) {
            this.part.activa = true;
          }
          this.notificationService.showSuccess('Piesa a fost activată cu succes!');
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la activarea piesei: ' + error.message);
          this.loadingService.setLoading(false);
        }
      });
    }
  }

  onDeactivatePart(): void {
    if (this.partId) {
      this.loadingService.setLoading(true, 'Se dezactivează piesa...');

      this.partService.deactivate(this.partId).subscribe({
        next: () => {
          if (this.part) {
            this.part.activa = false;
          }
          this.notificationService.showSuccess('Piesa a fost dezactivată cu succes!');
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la dezactivarea piesei: ' + error.message);
          this.loadingService.setLoading(false);
        }
      });
    }
  }

  onUpdateStock(): void {
    if (this.partId && this.part) {
      const newStock = prompt('Introduceți cantitatea nouă:', this.part.stock.toString());
      if (newStock !== null) {
        const quantity = parseInt(newStock, 10);
        if (!isNaN(quantity) && quantity >= 0) {
          this.loadingService.setLoading(true, 'Se actualizează stocul...');

          this.partService.updateStock(this.partId, quantity).subscribe({
            next: () => {
              if (this.part) {
                this.part.stock = quantity;
              }
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
  }

  onDeletePart(): void {
    if (this.partId && confirm('Sunteți sigur că doriți să ștergeți această piesă? Această acțiune nu poate fi anulată.')) {
      this.loadingService.setLoading(true, 'Se șterge piesa...');

      this.partService.delete(this.partId).subscribe({
        next: () => {
          this.notificationService.showSuccess('Piesa a fost ștearsă cu succes!');
          this.loadingService.setLoading(false);
          this.router.navigate(['/parts']);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la ștergerea piesei: ' + error.message);
          this.loadingService.setLoading(false);
        }
      });
    }
  }
}
