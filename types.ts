// types.ts

export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  hint?: string; //  متن راهنما به اینجا اضافه شد
}

export interface DescriptiveQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface QuizInfo {
  id: string;
  title: string;
  instructorName: string;
  examDate: string;
  examTime: string;
}

export interface QuizData {
  info: QuizInfo;
  questions: Question[];
  descriptiveQuestions: DescriptiveQuestion[];
}

export enum GameState {
  COURSE_SELECTION = "COURSE_SELECTION",
  SETUP = "SETUP",
  QUIZ = "QUIZ",
  RESULTS = "RESULTS",
}

export enum QuizMode {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  DESCRIPTIVE = "DESCRIPTIVE",
}
