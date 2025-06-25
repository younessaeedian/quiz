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
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_2310_43)">
      <rect width="24" height="24" rx="6" fill="#1EAAF2" />
      <path
        d="M17.319 8.44788L10.2071 15.5521L6.68115 12.0261"
        stroke="white"
        stroke-width="2.15721"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_2310_43">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const CrossIcon: React.FC<{ className?: string }> = ({
  className = "h-5 w-5",
}) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_2310_35)">
      <rect width="24" height="24" rx="6" fill="#D84848" />
      <path
        d="M8.44395 8.44788L15.5559 15.5521M15.5558 8.44788L8.44385 15.5521"
        stroke="white"
        stroke-width="2.15721"
        stroke-linecap="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_2310_35">
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
          return `${baseDuoStyle} bg-[#2FB5FA]/[0.15] text-white border-2 border-[#2FB5FA] border-b-[4px] border-b-[#2595c7] cursor-default animate-correct-pulse`;
        } else if (isSelected) {
          return `${baseDuoStyle} bg-red-500/[.15] text-white border-2 border-red-500 border-b-[4px] border-b-red-500 cursor-default animate-shake`;
        } else {
          return `${baseDuoStyle} bg-transparent text-gray-400 border-2 border-gray-600 border-b-[4px] border-b-gray-600 opacity-60 cursor-not-allowed`;
        }
      } else {
        // **تغییر اصلی:** بازگرداندن حالت سه‌بعدی با حفظ رنگ‌های جدید
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
