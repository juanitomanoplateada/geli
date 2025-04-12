import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Session {
  id: number;
  lab: string;
  equipment: string;
  date: string;
  time: string;
  user: string;
  available: string;
  remarks?: string;
}

@Component({
  selector: 'app-session-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './session-history.component.html',
  styleUrls: ['./session-history.component.scss'],
})
export class SessionHistoryComponent {
  searchQuery = '';
  selectedFilter = '';
  selectedSession: Session | null = null;

  sessions: Session[] = [
    {
      id: 1,
      lab: 'Laboratorio de DRX',
      equipment: 'Difractómetro PANalytical',
      date: '2025-04-09',
      time: '08:30',
      user: 'RAMIREZ RAMIREZ',
      available: 'Yes',
      remarks: 'All good',
    },
    {
      id: 2,
      lab: 'Laboratorio de Electrónica',
      equipment: 'Fuente DC BK Precision',
      date: '2025-04-08',
      time: '10:45',
      user: 'LOPEZ GARCIA',
      available: 'No',
      remarks: 'Equipo fuera de servicio',
    },
  ];

  get filteredSessions(): Session[] {
    return this.sessions.filter((s) =>
      s.lab.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  selectSession(session: Session) {
    this.selectedSession = session;
  }
}
