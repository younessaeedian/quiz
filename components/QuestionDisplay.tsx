import React, { useEffect, useCallback } from "react";
import { Question } from "../types";

interface QuestionDisplayProps {
  question: Question;
  options: string[];
  onAnswerSelect: (answer: string) => void;
  selectedAnswer: string | null;
  showFeedback: boolean;
  onNextQuestion: () => void;
  currentQuestionNumber: number;
  totalQuestions: number;
}

const AUTO_ADVANCE_DELAY_MS = 2000;

const toPersianDigits = (num: string | number): string => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(
    /[0-9]/g,
    (digit) => persianDigits[parseInt(digit)]
  );
};

const CheckIcon: React.FC<{ className?: string }> = ({
  className = "h-5 w-5",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="3"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CrossIcon: React.FC<{ className?: string }> = ({
  className = "h-5 w-5",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="3"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  options,
  onAnswerSelect,
  selectedAnswer,
  showFeedback,
  onNextQuestion,
  currentQuestionNumber,
  totalQuestions,
}) => {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showFeedback) {
      timer = setTimeout(() => {
        onNextQuestion();
      }, AUTO_ADVANCE_DELAY_MS);
    }
    return () => clearTimeout(timer);
  }, [showFeedback, onNextQuestion]);

  const getButtonClasses = useCallback(
    (option: string): string => {
      const baseDuoStyle =
        "w-full text-right font-bold rounded-xl py-3 px-4 flex items-center justify-between transform-gpu transition-transform duration-100 ease-in-out";

      if (showFeedback) {
        const isCorrectAnswer = option === question.answer;
        const isSelected = option === selectedAnswer;

        if (isCorrectAnswer) {
          return `${baseDuoStyle} bg-[#2FB5FA]/[0.15] text-white border-2 border-[#2FB5FA] border-b-[4px] border-b-[#2595c7] cursor-default animate-correct-pulse`;
        } else if (isSelected) {
          return `${baseDuoStyle} bg-red-500/[.15] text-white border-2 border-red-500 border-b-[4px] border-b-red-500 cursor-default animate-shake`;
        } else {
          return `${baseDuoStyle} bg-transparent text-slate-400 border-2 border-slate-600 border-b-[4px] border-b-slate-600 opacity-60 cursor-not-allowed`;
        }
      } else {
        return `${baseDuoStyle} bg-transparent text-slate-100 border-2 border-slate-700 border-b-[4px] active:translate-y-[2px] cursor-pointer`;
      }
    },
    [showFeedback, selectedAnswer, question.answer]
  );

  const getAriaLabel = (option: string): string => {
    if (showFeedback) {
      const isCorrectAnswer = option === question.answer;
      const isSelected = option === selectedAnswer;
      if (isCorrectAnswer) return `گزینه: ${option}. پاسخ صحیح.`;
      if (isSelected) return `گزینه: ${option}. انتخاب شما، پاسخ غلط.`;
      return `گزینه: ${option}. پاسخ غلط.`;
    }
    return `انتخاب گزینه: ${option}`;
  };

  return (
    <div className="space-y-6 fade-in pt-2 sm:pt-4 flex flex-col flex-grow">
      <div className="text-center text-sm text-slate-400 mb-3 sm:mb-4">
        سوال {toPersianDigits(currentQuestionNumber)} از{" "}
        {toPersianDigits(totalQuestions)}
      </div>
      <h2
        key={question.id + "-text"}
        className="text-lg sm:text-xl font-semibold text-slate-100 mb-4 sm:mb-6 text-right leading-relaxed animate-slide-in-left-content"
        style={{ minHeight: "4.5em" }}
      >
        {question.question}
      </h2>

      <div
        key={question.id + "-options"}
        className="space-y-3 animate-slide-in-left-content flex-grow flex flex-col justify-end"
      >
        {options.map((option, index) => {
          const buttonClasses = getButtonClasses(option);
          const isCorrectChoice = showFeedback && option === question.answer;
          const isSelectedIncorrectChoice =
            showFeedback &&
            option === selectedAnswer &&
            option !== question.answer;

          return (
            <button
              key={index}
              onClick={() => onAnswerSelect(option)}
              onTouchStart={() => {}}
              className={buttonClasses}
              disabled={showFeedback}
              aria-label={getAriaLabel(option)}
              aria-live={showFeedback ? "polite" : "off"}
            >
              {/* **تغییر اصلی:** بزرگ کردن فونت گزینه‌ها */}
              <span className="flex-1 text-right font-medium text-base sm:text-lg">
                {option}
              </span>
              {isCorrectChoice && (
                <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white ms-2 me-1" />
              )}
              {isSelectedIncorrectChoice && (
                <CrossIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white ms-2 me-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionDisplay;
