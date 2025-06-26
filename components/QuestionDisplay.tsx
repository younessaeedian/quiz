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

const AUTO_ADVANCE_DELAY_MS = 2500;

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
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g clipPath="url(#clip0_2310_43)">
      <rect width="24" height="24" rx="6" fill="#49C0F8" />
      <path
        d="M17.319 8.44788L10.2071 15.5521L6.68115 12.0261"
        stroke="#141F23"
        strokeWidth="2.15721"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_2310_43">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
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
        "w-full text-right font-bold rounded-2xl py-3 px-4 flex items-center justify-between transform-gpu transition-transform duration-100 ease-in-out";

      if (showFeedback) {
        const isCorrectAnswer = option === question.answer;
        const isSelected = option === selectedAnswer;

        if (isCorrectAnswer) {
          return `${baseDuoStyle} bg-[#3F85A7]/[.10] text-[#49C0F8] border-2 border-[#3F85A7] border-b-[4px] border-b-[#3F85A7] cursor-default animate-correct-pulse`;
        } else if (isSelected) {
          return `${baseDuoStyle} bg-[#FD6868]/[.10] text-[#FD6868] border-2 border-[#A63C3B] border-b-[4px] border-b-[#A63C3B] `;
        } else {
          return `${baseDuoStyle} bg-transparent text-gray-400 border-2 border-gray-600 border-b-[4px] border-b-gray-600 opacity-60 cursor-not-allowed`;
        }
      } else {
        return `${baseDuoStyle} bg-transparent text-gray-100 border-2 border-[#38464F] border-b-[4px] active:translate-y-[2px] cursor-pointer`;
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
      <div className="text-center text-sm text-gray-400 mb-3 sm:mb-4">
        سوال {toPersianDigits(currentQuestionNumber)} از{" "}
        {toPersianDigits(totalQuestions)}
      </div>
      <h2
        key={question.id + "-text"}
        className="text-lg sm:text-xl font-semibold text-gray-100 mb-4 sm:mb-6 text-right leading-relaxed animate-slide-in-left-content"
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
              <span className="flex-1 text-right font-medium text-base sm:text-lg">
                {option}
              </span>
              {isCorrectChoice && (
                <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6 ms-2 me-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionDisplay;
