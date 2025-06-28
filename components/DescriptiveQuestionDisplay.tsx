// components/DescriptiveQuestionDisplay.tsx

import React, { useState } from "react";
import { DescriptiveQuestion } from "../types";

interface DescriptiveQuestionDisplayProps {
  question: DescriptiveQuestion;
  onNextQuestion: () => void;
  onRestart: () => void;
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

const DescriptiveQuestionDisplay: React.FC<DescriptiveQuestionDisplayProps> = ({
  question,
  onNextQuestion,
  onRestart,
  currentQuestionNumber,
  totalQuestions,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const isLastQuestion = currentQuestionNumber === totalQuestions;

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNext = () => {
    setShowAnswer(false);
    onNextQuestion();
  };

  const baseClasses =
    "w-full font-bold rounded-2xl py-3 px-6 sm:px-8 text-base sm:text-lg";

  const nextButtonClasses = `
    ${baseClasses} 
    text-[#141F23] bg-[#49C0F8] 
    border-b-4 border-[#1898D5]
    active:translate-y-[2px] active:border-b-2
    transform-gpu transition-transform duration-100 ease-in-out
  `;

  const showAnswerButtonClasses = `
    ${baseClasses}
    bg-transparent text-gray-100 
    border-2 border-[#38464F] border-b-[4px] 
    active:translate-y-[2px] cursor-pointer
    transform-gpu transition-transform duration-100 ease-in-out
  `;

  return (
    <div className="flex flex-col justify-center flex-grow">
      <div key={question.id} className="animate-slide-in-left">
        <div className="text-center text-sm text-gray-400 mb-3 sm:mb-4">
          سوال {toPersianDigits(currentQuestionNumber)} از{" "}
          {toPersianDigits(totalQuestions)}
        </div>
        <h2
          className="text-lg sm:text-xl font-semibold text-gray-100 mb-4 sm:mb-6 text-center leading-relaxed"
          style={{ minHeight: "4.5em" }}
        >
          {question.question}
        </h2>
        {showAnswer && (
          <div className="fade-in p-4 bg-[#202F36] rounded-xl text-right leading-relaxed">
            <p className="text-gray-300">{question.answer}</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#141F23]/80 backdrop-blur-sm px-4 pt-4 pb-8 z-30 border-t border-gray-700/50">
        <div className="max-w-xl mx-auto space-y-3">
          {!showAnswer ? (
            <button
              onClick={handleShowAnswer}
              className={showAnswerButtonClasses}
            >
              نمایش پاسخ
            </button>
          ) : isLastQuestion ? (
            <button onClick={onRestart} className={nextButtonClasses}>
              بازگشت به صفحه اصلی
            </button>
          ) : (
            <button onClick={handleNext} className={nextButtonClasses}>
              سوال بعدی
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DescriptiveQuestionDisplay;
