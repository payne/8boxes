import { Component, OnInit, inject, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Observable, startWith, switchMap, of } from 'rxjs';
import { MemberService } from '../../services/member.service';
import { Member, NetParticipant, Training, TrainingConfig } from '../../models/member.model';

@Component({
  selector: 'app-net-grid',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatInputModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './net-grid.component.html',
  styleUrls: ['./net-grid.component.scss']
})
export class NetGridComponent implements OnInit {
  private memberService = inject(MemberService);

  callsignControl = new FormControl<string | Member>('');
  filteredMembers$!: Observable<Member[]>;
  trainingConfigs: TrainingConfig[] = [];

  displayedColumns = ['callsign', 'name', 'IC1', 'IC2', 'IC7', 'IC8', 'EC1', 'SKY', 'WIN', 'EOC'];
  trainingIds = ['IC1', 'IC2', 'IC7', 'IC8', 'EC1', 'SKY', 'WIN', 'EOC'];

  inputRow: NetParticipant = this.createEmptyParticipant();
  participants: NetParticipant[] = [];

  @ViewChildren('inputCell') inputCells!: QueryList<ElementRef>;

  ngOnInit(): void {
    this.filteredMembers$ = this.callsignControl.valueChanges.pipe(
      startWith(''),
      switchMap(value => {
        const searchTerm = typeof value === 'string' ? value : value?.callsign || '';
        if (!searchTerm || searchTerm.length < 1) {
          return of([]);
        }
        return this.memberService.searchByCallsign(searchTerm);
      })
    );

    this.memberService.getTrainingConfig().subscribe(configs => {
      this.trainingConfigs = configs;
    });
  }

  createEmptyParticipant(): NetParticipant {
    return {
      callsign: '',
      name: '',
      trainings: this.trainingIds.map(id => ({
        training_id: id,
        training_name: this.getTrainingName(id),
        state: 'NO'
      }))
    };
  }

  getTrainingName(id: string): string {
    const config = this.trainingConfigs.find(c => c.id === id);
    return config?.name || id;
  }

  onMemberSelected(member: Member): void {
    this.inputRow.callsign = member.callsign;
    this.inputRow.name = member.name;
    this.inputRow.trainings = [...member.trainings];
    this.callsignControl.setValue(member.callsign);
  }

  displayCallsign(value: Member | string): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.callsign;
  }

  getTrainingState(participant: NetParticipant, trainingId: string): string {
    const training = participant.trainings.find(t => t.training_id === trainingId);
    return training?.state || 'NO';
  }

  setTrainingState(participant: NetParticipant, trainingId: string, state: string): void {
    const training = participant.trainings.find(t => t.training_id === trainingId);
    if (training) {
      training.state = state;
    }
  }

  getTrainingConfig(trainingId: string): TrainingConfig | undefined {
    return this.trainingConfigs.find(c => c.id === trainingId);
  }

  getStateColor(trainingId: string, state: string): string {
    const config = this.getTrainingConfig(trainingId);
    const stateConfig = config?.states.find(s => s.abbrev === state);
    return stateConfig?.color || '#808080';
  }

  onKeydown(event: KeyboardEvent, columnIndex: number): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addParticipant();
    } else if (event.key === 'Tab') {
      const cells = this.inputCells.toArray();
      if (event.shiftKey) {
        if (columnIndex > 0) {
          event.preventDefault();
          this.focusCell(columnIndex - 1);
        }
      } else {
        if (columnIndex < cells.length - 1) {
          event.preventDefault();
          this.focusCell(columnIndex + 1);
        }
      }
    }
  }

  focusCell(index: number): void {
    const cells = this.inputCells.toArray();
    if (cells[index]) {
      const el = cells[index].nativeElement;
      if (el.tagName === 'INPUT') {
        el.focus();
      } else {
        const input = el.querySelector('input, select, .mat-mdc-select');
        if (input) {
          input.focus();
        }
      }
    }
  }

  addParticipant(): void {
    if (this.inputRow.callsign) {
      this.participants.unshift({ ...this.inputRow, trainings: [...this.inputRow.trainings] });
      this.inputRow = this.createEmptyParticipant();
      this.callsignControl.setValue('');
      setTimeout(() => this.focusCell(0), 0);
    }
  }
}
