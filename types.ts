// quiz - Copy/types.ts

export interface Question {
  id: string;
  question: string;
  // یک آرایه از گزینه‌ها به این ساختار اضافه می‌شود
  options: string[]; 
  answer: string;
}

export enum GameState {
  SETUP = 'SETUP',
  QUIZ = 'QUIZ',
  RESULTS = 'RESULTS',
}