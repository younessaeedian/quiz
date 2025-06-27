import React, { useEffect, useRef } from "react";
import lottie from "lottie-web";
import { goodScoreAnimationData } from "../data/goodScoreAnimation";

interface ResultsScreenProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  onStartGlobalReviewQuiz: () => void;
  globalIncorrectCount: number;
}

const toPersianDigits = (num: string | number): string => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(
    /[0-9]/g,
    (digit) => persianDigits[parseInt(digit)]
  );
};

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  score,
  totalQuestions,
  onRestart,
  onStartGlobalReviewQuiz,
  globalIncorrectCount,
}) => {
  const animationContainerRef = useRef<HTMLDivElement>(null);
  const gradeValue =
    totalQuestions > 0
      ? parseFloat(((score / totalQuestions) * 20).toFixed(1))
      : 0;
  const isGoodScore = gradeValue >= 12;

  // ===== شروع بخش تغییرات =====

  let feedbackTitle = "";
  let feedbackMessage = "";
  let scoreColorClass = "";

  if (gradeValue >= 16) {
    feedbackTitle = "فوق‌العاده!";
    feedbackMessage = "دمت گرم! عالی بود، همین فرمونو برو جلو.";
    scoreColorClass = "text-green-400"; // رنگ یک پله روشن‌تر شد
  } else if (gradeValue >= 12) {
    feedbackTitle = "آفرین، نمره‌ات خوبه!";
    feedbackMessage =
      "فقط یه کم بیشتر تمرین کنی، همه سوال‌ها رو کامل جواب می‌دی.";
    scoreColorClass = "text-cyan-400"; // رنگ یک پله روشن‌تر شد
  } else if (gradeValue >= 8) {
    feedbackTitle = "میتونی بهتر باشی";
    feedbackMessage = "بدک نبود! تمرینت رو بیشتر کن، نتیجه‌شو می‌بینی.";
    scoreColorClass = "text-yellow-400"; // رنگ یک پله روشن‌تر شد
  } else {
    feedbackTitle = "عیبی نداره، دوباره شروع کن";
    feedbackMessage = "کم‌کم پیشرفت می‌کنی و نتیجه‌شو می‌بینی.";
    scoreColorClass = "text-red-400"; // رنگ یک پله روشن‌تر شد
  }
  // ===== پایان بخش تغییرات =====

  const baseClasses =
    "w-full font-bold rounded-2xl py-3 px-6 sm:px-8 text-base sm:text-lg";

  const reviewButtonClasses = `
    ${baseClasses}
    bg-transparent text-gray-100 
    border-2 border-[#38464F] border-b-[4px] 
    active:translate-y-[2px] cursor-pointer
    transform-gpu transition-transform duration-100 ease-in-out
  `;

  const restartButtonClasses = `
    ${baseClasses} 
    text-[#141F23] bg-[#49C0F8] 
    border-b-4 border-[#1898D5]
    active:translate-y-[2px] active:border-b-2
    transform-gpu transition-transform duration-100 ease-in-out
  `;

  useEffect(() => {
    let anim: any = null;

    if (isGoodScore && animationContainerRef.current) {
      try {
        const parsedAnimationData = JSON.parse(goodScoreAnimationData);
        anim = lottie.loadAnimation({
          container: animationContainerRef.current,
          renderer: "svg",
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
  }, [isGoodScore]);

  return (
    <div className="container mx-auto text-center flex-grow flex flex-col justify-center">
      <div className="score-section mb-12">
        <div
          className={`score-main text-8xl font-bold mb-2 transition-colors duration-500 ${scoreColorClass}`}
        >
          {toPersianDigits(gradeValue)}
        </div>
        <div className="score-total text-xl text-gray-400">
          از {toPersianDigits(20)} نمره
        </div>
      </div>

      <div className="stats-container mb-12">
        <div className="flex justify-between space-x-3 rtl:space-x-reverse">
          <div className="stat-item flex-1 text-center bg-[#202F36] p-4 rounded-xl">
            <div className="stat-number text-3xl font-semibold text-white mb-2">
              {toPersianDigits(score)}
            </div>
            <div className="stat-label text-sm font-medium text-gray-400">
              پاسخ درست
            </div>
          </div>
          <div className="stat-item flex-1 text-center bg-[#202F36] p-4 rounded-xl">
            <div className="stat-number text-3xl font-semibold text-white mb-2">
              {toPersianDigits(totalQuestions - score)}
            </div>
            <div className="stat-label text-sm font-medium text-gray-400">
              پاسخ نادرست
            </div>
          </div>
          <div className="stat-item flex-1 text-center bg-[#202F36] p-4 rounded-xl">
            <div className="stat-number text-3xl font-semibold text-white mb-2">
              {toPersianDigits(totalQuestions)}
            </div>
            <div className="stat-label text-sm font-medium text-gray-400">
              کل سوالات
            </div>
          </div>
        </div>
      </div>

      <div className="hint-section mb-12 px-4">
        {/* تیتر بازخورد به رنگ سفید و ثابت بازگشت */}
        <h2 className={`text-xl sm:text-2xl font-bold text-white mb-2`}>
          {feedbackTitle}
        </h2>
        <p
          className="hint-text text-base text-gray-400 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: feedbackMessage }}
        ></p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#141F23]/80 backdrop-blur-sm px-4 pt-4 pb-8 z-30 border-t border-gray-700/50">
        <div className="max-w-xl mx-auto space-y-3">
          {globalIncorrectCount > 0 && (
            <button
              onClick={onStartGlobalReviewQuiz}
              className={reviewButtonClasses}
              aria-label={`مرور ${toPersianDigits(
                globalIncorrectCount
              )} سوالی که قبلا اشتباه پاسخ داده اید`}
            >
              مرور سوال‌های غلط ({toPersianDigits(globalIncorrectCount)} سوال)
            </button>
          )}
          <button
            onClick={onRestart}
            className={restartButtonClasses}
            aria-label="شروع دوباره آزمون"
          >
            شروع دوباره آزمون
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
