export interface Training {
  training_id: string;
  training_name: string;
  state: string;
}

export interface Member {
  name: string;
  callsign: string;
  clubs: string[];
  trainings: Training[];
}

export interface TrainingState {
  name: string;
  abbrev: string;
  color: string;
}

export interface TrainingConfig {
  id: string;
  name: string;
  description: string;
  states: TrainingState[];
}

export interface TrainingConfigFile {
  trainings: TrainingConfig[];
}

export interface NetParticipant {
  callsign: string;
  name: string;
  trainings: Training[];
}
