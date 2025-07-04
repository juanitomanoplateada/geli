import { Injectable } from '@angular/core';
import { LabeledOption } from '../../../shared/components/dropdown-search-entity-obj/dropdown-search-entity-obj.component';
import { EquipmentByUserResponseDTO } from '../../dto/equipments-patterns/equipment-by-user-response.dto';

@Injectable({
  providedIn: 'root',
})
export class EquipmentHelperService {
  toLabeledOptions(equipments: EquipmentByUserResponseDTO[]): LabeledOption[] {
    return equipments.map((eq) => ({
      label: `${eq.equipmentName} - ${eq.inventoryNumber}`,
      value: String(eq.id),
    }));
  }

  parseEquipmentStatus(statusDto: { active: boolean; message?: string }): {
    active: boolean;
    remarks: string;
  } {
    return {
      active: statusDto.active,
      remarks: statusDto.message || 'Sin observaciones registradas.',
    };
  }

  parseUsageStatus(statusDto: {
    status: 'AVAILABLE' | 'IN_USE_BY_YOU' | 'IN_USE_BY_ANOTHER';
  }): {
    usedByYou: boolean;
    usedByAnother: boolean;
  } {
    return {
      usedByYou: statusDto.status === 'IN_USE_BY_YOU',
      usedByAnother: statusDto.status === 'IN_USE_BY_ANOTHER',
    };
  }
}
