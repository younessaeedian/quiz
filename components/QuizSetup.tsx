import React from "react";
import { quizDetails } from "../data/quizinfo";

interface QuizSetupProps {
  onStartNewQuiz: () => void;
  onStartReviewQuiz: () => void;
  incorrectQuestionsCount: number;
}

const toPersianDigits = (num: string | number): string => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(
    /[0-9]/g,
    (digit) => persianDigits[parseInt(digit)]
  );
};

const CalendarIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
);

const UserIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const QuizSetup: React.FC<QuizSetupProps> = ({
  onStartNewQuiz,
  onStartReviewQuiz,
  incorrectQuestionsCount,
}) => {
  const baseClasses =
    "w-full font-bold rounded-2xl py-3 px-6 sm:px-8 text-base sm:text-lg";

  // ===== تغییر اصلی در اینجا اعمال شده است =====
  const reviewButtonClasses = `
    ${baseClasses}
    bg-transparent text-gray-100 
    border-2 border-[#38464F] border-b-[4px] 
    active:translate-y-[2px] cursor-pointer
    transform-gpu transition-transform duration-100 ease-in-out
  `;

  const blueButtonClasses = `
    ${baseClasses} 
    text-[#141F23] bg-[#49C0F8] 
    border-b-4 border-[#1898D5]
    active:translate-y-[2px] active:border-b-2
    transform-gpu transition-transform duration-100 ease-in-out
  `;

  return (
    <div className="flex-grow flex flex-col justify-between h-full">
      <div className="fade-in flex-grow flex flex-col justify-center space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {quizDetails.title}
          </h1>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            این یک آزمون آزمایشی برای آمادگی شما در درس {quizDetails.title} است.
          </p>
        </div>

        <div className="bg-[#202F36] rounded-2xl">
          <div className="flex items-center p-4 border-b border-gray-700">
            <div className="flex items-center justify-center w-11 h-11 shrink-0 ml-4 rounded-xl bg-[#374951] text-white">
              <UserIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-400 mb-0.5">
                مدرس
              </div>
              <div className="text-base font-semibold text-gray-100">
                {quizDetails.instructorName}
              </div>
            </div>
          </div>

          <div className="flex items-center p-4 border-b border-gray-700">
            <div className="flex items-center justify-center w-11 h-11 shrink-0 ml-4 rounded-xl bg-[#374951] text-white">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-400 mb-0.5">
                تاریخ امتحان
              </div>
              <div className="text-base font-semibold text-gray-100">
                {toPersianDigits(quizDetails.examDate)}
              </div>
            </div>
          </div>

          <div className="flex items-center p-4">
            <div className="flex items-center justify-center w-11 h-11 shrink-0 ml-4 rounded-xl bg-[#374951] text-white">
              <ClockIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-400 mb-0.5">
                ساعت برگزاری
              </div>
              <div className="text-base font-semibold text-gray-100">
                {toPersianDigits(quizDetails.examTime)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 pb-8">
        <div className="space-y-3">
          {incorrectQuestionsCount > 0 && (
            <button
              onClick={onStartReviewQuiz}
              onTouchStart={() => {}}
              className={reviewButtonClasses}
              aria-label={`مرور ${toPersianDigits(
                incorrectQuestionsCount
              )} سوالی که قبلا اشتباه پاسخ داده اید`}
            >
              مرور سوال‌های غلط ({toPersianDigits(incorrectQuestionsCount)}{" "}
              سوال)
            </button>
          )}
          <button
            onClick={onStartNewQuiz}
            onTouchStart={() => {}}
            className={blueButtonClasses}
            aria-label="شروع آزمون جدید"
          >
            شروع آزمون
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizSetup;
