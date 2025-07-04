import { Injectable } from '@angular/core';
import { LabeledOption } from '../../../shared/components/dropdown-search-entity-obj/dropdown-search-entity-obj.component';
import { Laboratory } from '../../dto/laboratory/laboratory.dto';

@Injectable({
  providedIn: 'root',
})
export class LaboratoryHelperService {
  toLabeledOptions(labs: Laboratory[]): LabeledOption[] {
    return labs.map((lab) => ({
      label: `${lab.laboratoryName} - ${lab.location.locationName}`,
      value: String(lab.id),
    }));
  }
}
