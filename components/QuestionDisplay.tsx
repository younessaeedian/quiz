// components/QuestionDisplay.tsx

import React, { useCallback, useMemo } from "react";
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
        strokeWidth="3"
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
  const isLastQuestion = useMemo(
    () => currentQuestionNumber === totalQuestions,
    [currentQuestionNumber, totalQuestions]
  );

  const getButtonClasses = useCallback(
    (option: string): string => {
      const baseDuoStyle =
        "w-full text-right font-bold rounded-2xl py-3 px-4 flex items-center justify-between transform-gpu transition-transform duration-100 ease-in-out";

      if (showFeedback) {
        const isCorrectOption = option === question.answer;
        const isSelectedOption = option === selectedAnswer;

        if (isSelectedOption && isCorrectOption) {
          return `${baseDuoStyle} bg-[#3F85A7]/[.10] text-[#49C0F8] border-2 border-[#3F85A7] border-b-[4px] border-b-[#3F85A7] cursor-default animate-correct-pulse`;
        }
        if (isSelectedOption && !isCorrectOption) {
          return `${baseDuoStyle} bg-[#FD6868]/[.10] text-[#FD6868] border-2 border-[#A63C3B] border-b-[4px] border-b-[#A63C3B] animate-shake`;
        }
        if (isCorrectOption && !isSelectedOption) {
          return `${baseDuoStyle} bg-[#3F85A7]/[.10] text-[#49C0F8] border-2 border-[#3F85A7] border-b-[4px] border-b-[#3F85A7] cursor-default`;
        }
        return `${baseDuoStyle} bg-transparent text-gray-400 border-2 border-gray-600 border-b-[4px] border-b-gray-600 opacity-60 cursor-not-allowed`;
      }

      return `${baseDuoStyle} bg-transparent text-gray-100 border-2 border-[#38464F] border-b-[4px] active:translate-y-[2px] cursor-pointer`;
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

  const nextButtonClasses =
    "w-full font-bold rounded-2xl py-3 px-6 sm:px-8 text-base sm:text-lg text-[#141F23] bg-[#49C0F8] border-b-4 border-[#1898D5] active:translate-y-[2px] active:border-b-2 transform-gpu transition-transform duration-100 ease-in-out";

  return (
    <div className="flex flex-col justify-center flex-grow">
      <div key={question.id} className="animate-slide-in-left pb-24">
        <div className="text-right text-sm text-gray-400 mb-3 sm:mb-4">
          سوال {toPersianDigits(currentQuestionNumber)} از{" "}
          {toPersianDigits(totalQuestions)}
        </div>
        <h2
          className="text-lg sm:text-xl font-semibold text-gray-100 mb-4 sm:mb-6 text-right leading-relaxed"
          style={{ minHeight: "4.5em" }}
        >
          {question.question}
        </h2>
        <div className="space-y-3">
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
                  <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6 ms-2" />
                )}
              </button>
            );
          })}
        </div>
        {showFeedback && question.hint && (
          <div className="mt-4 p-4 bg-[#202F36] rounded-xl text-right leading-relaxed fade-in">
            <p className="text-gray-300">{question.hint}</p>
          </div>
        )}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-[#141F23]/80 backdrop-blur-sm px-4 pt-4 pb-8 z-30 border-t border-gray-700/50">
        <div className="max-w-xl mx-auto flex flex-col items-center">
          {showFeedback && (
            <button
              onClick={onNextQuestion}
              className={`${nextButtonClasses} mb-3`}
            >
              {isLastQuestion ? "مشاهده نتایج" : "سوال بعدی"}
            </button>
          )}
          <a
            href="https://t.me/unuos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Developed by Younes Saeedian
          </a>
        </div>
      </footer>
    </div>
  );
};

export default QuestionDisplay;
