import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    lottie?: any;
  }
}

interface ResultsScreenProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  onStartGlobalReviewQuiz: () => void;
  globalIncorrectCount: number;
  animationData?: string;
}

const toPersianDigits = (num: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)]);
};

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  score,
  totalQuestions,
  onRestart,
  onStartGlobalReviewQuiz,
  globalIncorrectCount,
  animationData,
}) => {
  const animationContainerRef = useRef<HTMLDivElement>(null);
  const gradeValue = totalQuestions > 0 ? parseFloat(((score / totalQuestions) * 20).toFixed(1)) : 0;
  const isGoodScore = gradeValue >= 12;

  let feedbackMessage = "";
  if (gradeValue >= 16) {
    feedbackMessage = "دمت گرم! عالی بود، همین فرمونو برو جلو.";
  } else if (gradeValue >= 12) {
    feedbackMessage = "آفرین! فقط یه کم بیشتر تمرین کنی، همه سوال‌ها رو کامل جواب می‌دی.";
  } else if (gradeValue >= 8) {
    feedbackMessage = "بدک نبود! تمرینت رو بیشتر کن، نتیجه‌شو می‌بینی.";
  } else {
    feedbackMessage = "عیبی نداره! دوباره شروع کن، کم‌کم پیشرفت می‌کنی و نتیجه‌شو می‌بینی.";
  }
  
  const baseClasses = "w-full font-bold rounded-xl py-3 px-6 sm:px-8 text-base sm:text-lg";

  // استایل دکمه مرور، دقیقاً مشابه صفحه شروع
  const reviewButtonClasses = `
    ${baseClasses}
    text-white bg-slate-700
    border-b-4 border-slate-900
    active:translate-y-[2px] active:border-b-2
    transform-gpu transition-transform duration-100 ease-in-out
  `;
  
  // استایل دکمه اصلی (آبی)، دقیقاً مشابه صفحه شروع
  const primaryButtonClasses = `
    ${baseClasses} 
    text-white bg-[#2FB5FA] 
    border-b-4 border-[#1A7A9A]
    active:translate-y-[2px] active:border-b-2
    transform-gpu transition-transform duration-100 ease-in-out
  `;

  useEffect(() => {
    let anim: any = null;

    if (isGoodScore && animationData && animationContainerRef.current && window.lottie) {
      try {
        const parsedAnimationData = JSON.parse(animationData);
        anim = window.lottie.loadAnimation({
          container: animationContainerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: parsedAnimationData,
        });
      } catch (error) {
        console.error("Failed to parse or load Lottie animation:", error);
      }
    }
    
    return () => {
      if (anim) {
        anim.destroy();
      }
    };
  }, [isGoodScore, animationData]);

  return (
    <>
      <div className="space-y-6 text-center fade-in flex-grow flex flex-col justify-center">
        {isGoodScore && animationData && (
          <div 
            ref={animationContainerRef} 
            className="w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-3"
            aria-label="انیمیشن تشویقی برای نمره خوب"
            role="img"
          ></div>
        )}
        <div>
          <h2 className="text-3xl font-bold text-[#2FB5FA]">
            نمره شما: <span className="font-bold">{toPersianDigits(gradeValue)}</span> از {toPersianDigits(20)}
          </h2>
          <p className="text-xl text-slate-200 mt-2">
            <span className="font-bold">{toPersianDigits(score)}</span> پاسخ درست از <span className="font-bold">{toPersianDigits(totalQuestions)}</span> سوال
          </p>
          <p className="text-slate-300 mt-4 mb-6">{feedbackMessage}</p>
        </div>
      </div>

      {/* پس‌زمینه نوار دکمه‌ها مشابه صفحه شروع */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-sm p-4 z-30 border-t border-slate-700/50">
        <div className="max-w-xl mx-auto space-y-3">
          {globalIncorrectCount > 0 && (
            <button
              onClick={onStartGlobalReviewQuiz}
              onTouchStart={() => {}}
              className={reviewButtonClasses} 
              aria-label={`مرور ${toPersianDigits(globalIncorrectCount)} سوالی که قبلا اشتباه پاسخ داده اید`}
            >
            مرور سوال‌های غلط ({toPersianDigits(globalIncorrectCount)} سوال)
            </button>
          )}

          <button
            onClick={onRestart}
            onTouchStart={() => {}}
            className={primaryButtonClasses}
            aria-label="شروع دوباره آزمون"
          >
            شروع دوباره آزمون
          </button>
        </div>
      </div>
    </>
  );
};

export default ResultsScreen;