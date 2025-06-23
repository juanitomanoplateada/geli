import { Injectable } from '@angular/core';
import { PositionService } from './position.service';
import { map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PositionHelperService {
  constructor(private positionService: PositionService) {}

  getFormattedPositionOptions() {
    return this.positionService.getAll().pipe(
      map((positions) =>
        (positions || []).map((p) => ({
          label: p.positionName,
          value: { id: p.id, positionName: p.positionName },
        }))
      ),
      catchError((error) => {
        console.error('Error cargando posiciones:', error);
        return of([]);
      })
    );
  }
}
