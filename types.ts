
export interface Question {
  id: string;
  question: string;
  answer: string;
}

export enum GameState {
  SETUP = 'SETUP',
  QUIZ = 'QUIZ',
  RESULTS = 'RESULTS',
}