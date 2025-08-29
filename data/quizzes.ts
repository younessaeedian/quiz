// data/quizzes.ts
import { QuizData } from "../types";
import { defaultQuestions as tarikhEslamQuestions } from "./tarikh-eslam/questions";
import { descriptiveQuestions as tarikhEslamDescriptiveQuestions } from "./tarikh-eslam/descriptiveQuestions";
import { tarikhEslamQuizInfo } from "./tarikh-eslam/quizinfo";
import { aiQuestions } from "./ai/questions";
import { aiDescriptiveQuestions } from "./ai/descriptiveQuestions";
import { aiQuizInfo } from "./ai/quizinfo";

export const quizzes: { [key: string]: QuizData } = {
  "tarikh-eslam": {
    info: tarikhEslamQuizInfo,
    questions: tarikhEslamQuestions,
    descriptiveQuestions: tarikhEslamDescriptiveQuestions,
  },
  ai: {
    info: aiQuizInfo,
    questions: aiQuestions,
    descriptiveQuestions: aiDescriptiveQuestions,
  },
};
