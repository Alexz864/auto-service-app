import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Part } from '../../../../core/models/part.model';
import { PartService } from '../../../../core/services/part.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-add-part',
  templateUrl: './add-part.component.html',
  styleUrls: ['./add-part.component.scss']
})
export class AddPartComponent implements OnInit {
  part: Part | null = null;
  loading: boolean = false;
  isEditMode: boolean = false;
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
      this.isEditMode = true;
      this.loadPart();
    }
  }

  loadPart(): void {
    if (this.partId) {
      this.loading = true;
      this.loadingService.setLoading(true, 'Se încarcă datele piesei...');

      this.partService.getById(this.partId).subscribe({
        next: (data) => {
          this.part = data;
          this.loading = false;
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la încărcarea piesei: ' + error.message);
          this.loading = false;
          this.loadingService.setLoading(false);
          this.router.navigate(['/parts']);
        }
      });
    }
  }

  onSubmit(partData: Part): void {
    this.loading = true;
    this.loadingService.setLoading(true, this.isEditMode ? 'Se actualizează piesa...' : 'Se adaugă piesa...');

    if (this.isEditMode && this.partId) {
      this.partService.update(this.partId, partData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Piesa a fost actualizată cu succes!');
          this.loading = false;
          this.loadingService.setLoading(false);
          this.router.navigate(['/parts', this.partId]);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la actualizarea piesei: ' + error.message);
          this.loading = false;
          this.loadingService.setLoading(false);
        }
      });
    } else {
      this.partService.create(partData).subscribe({
        next: (result) => {
          this.notificationService.showSuccess('Piesa a fost adăugată cu succes!');
          this.loading = false;
          this.loadingService.setLoading(false);
          this.router.navigate(['/parts', result.id]);
        },
        error: (error) => {
          this.notificationService.showError('Eroare la adăugarea piesei: ' + error.message);
          this.loading = false;
          this.loadingService.setLoading(false);
        }
      });
    }
  }
}
