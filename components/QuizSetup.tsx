import React from 'react';
import { quizDetails } from '../data/quizinfo';

interface QuizSetupProps {
  onStartNewQuiz: () => void;
  onStartReviewQuiz: () => void;
  incorrectQuestionsCount: number;
}

const toPersianDigits = (num: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)]);
};

const CalendarIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/>
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
  </svg>
);

const UserIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);


const QuizSetup: React.FC<QuizSetupProps> = ({ onStartNewQuiz, onStartReviewQuiz, incorrectQuestionsCount }) => {
  // کلاس‌های پایه شامل اندازه و فونت
  const baseClasses = "w-full font-bold rounded-xl py-3 px-6 sm:px-8 text-base sm:text-lg";

  // کلاس‌های دکمه آبی با تکنیک نهایی
  const blueButtonClasses = `
    ${baseClasses} 
    text-white bg-[#2FB5FA] 
    border-b-4 border-[#1A7A9A]
    active:translate-y-[2px] active:border-b-2
    transform-gpu transition-transform duration-100 ease-in-out
  `;

  // کلاس‌های دکمه مرور (خاکستری) با تکنیک نهایی
  const reviewButtonClasses = `
    ${baseClasses}
    text-white bg-slate-700
    border-b-4 border-slate-900
    active:translate-y-[2px] active:border-b-2
    transform-gpu transition-transform duration-100 ease-in-out
  `;


  return (
    <>
      <div className="space-y-8 fade-in flex-grow">
        <div className="text-center space-y-3">
          {/* تغییر رنگ عنوان اصلی به سفید */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{quizDetails.title}</h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            این یک آزمون آزمایشی برای آمادگی شما در درس {quizDetails.title} است.
          </p>
        </div>

        <div className="space-y-2 text-sm text-slate-300 border border-slate-700 p-4 rounded-2xl bg-slate-800/30">
          <div className="flex items-center space-x-2 space-x-reverse">
            <UserIcon className="w-5 h-5 text-[#2FB5FA]" />
            <span className="font-semibold w-16">مدرس:</span>
            <span>{quizDetails.instructorName}</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <CalendarIcon className="w-5 h-5 text-[#2FB5FA]" />
            <span className="font-semibold w-16">تاریخ:</span>
            <span>{toPersianDigits(quizDetails.examDate)}</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <ClockIcon className="w-5 h-5 text-[#2FB5FA]" />
            <span className="font-semibold w-16">ساعت:</span>
            <span>{toPersianDigits(quizDetails.examTime)}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-sm p-4 z-30">
        <div className="max-w-xl mx-auto space-y-3">
          {incorrectQuestionsCount > 0 && (
            <button
              onClick={onStartReviewQuiz}
              onTouchStart={() => {}}
              className={reviewButtonClasses}
              aria-label={`مرور ${toPersianDigits(incorrectQuestionsCount)} سوالی که قبلا اشتباه پاسخ داده اید`}
            >
            مرور سوال‌های غلط ({toPersianDigits(incorrectQuestionsCount)} سوال)
            </button>
          )}
          <button
            onClick={onStartNewQuiz}
            onTouchStart={() => {}}
            className={blueButtonClasses}
            aria-label="شروع آزمون جدید"
          >
            شروع آزمون جدید
          </button>
        </div>
      </div>
    </>
  );
};

export default QuizSetup;