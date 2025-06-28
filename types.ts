// types.ts

export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
}

export interface DescriptiveQuestion {
  id: string;
  question: string;
  answer: string;
}

export enum GameState {
  SETUP = "SETUP",
  QUIZ = "QUIZ",
  RESULTS = "RESULTS",
}

export enum QuizMode {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  DESCRIPTIVE = "DESCRIPTIVE",
}
