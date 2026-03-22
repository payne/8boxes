import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, forkJoin } from 'rxjs';
import { Member, TrainingConfig, TrainingConfigFile } from '../models/member.model';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private http = inject(HttpClient);

  private readonly baseUrl = 'https://raw.githubusercontent.com/payne/8boxes/refs/heads/main';

  private members$: Observable<Member[]> = this.http.get<Member[]>(`${this.baseUrl}/members.json`).pipe(
    shareReplay(1)
  );

  private trainingConfig$: Observable<TrainingConfig[]> = this.http.get<TrainingConfigFile>(`${this.baseUrl}/training-config.json`).pipe(
    map(config => config.trainings),
    shareReplay(1)
  );

  getMembers(): Observable<Member[]> {
    return this.members$;
  }

  getTrainingConfig(): Observable<TrainingConfig[]> {
    return this.trainingConfig$;
  }

  searchByCallsign(partial: string): Observable<Member[]> {
    const upperPartial = partial.toUpperCase();
    return this.members$.pipe(
      map(members =>
        members
          .filter(m => m.callsign && m.callsign.toUpperCase().includes(upperPartial))
          .sort((a, b) => a.callsign.localeCompare(b.callsign))
      )
    );
  }

  getMemberByCallsign(callsign: string): Observable<Member | undefined> {
    const upperCallsign = callsign.toUpperCase();
    return this.members$.pipe(
      map(members => members.find(m => m.callsign.toUpperCase() === upperCallsign))
    );
  }
}
