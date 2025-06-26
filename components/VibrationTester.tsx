import React from "react";

// الگوهای مختلف ویبره برای تست
const vibrationPatterns = [
  { name: "کوتاه", pattern: [50] },
  { name: "دو ضرب", pattern: [70, 60, 70] },
  { name: "طولانی", pattern: [200] },
  { name: "ضربان قلب", pattern: [80, 50, 80, 50, 80] },
  { name: "هشدار", pattern: [300, 100, 100] },
  { name: "سریع", pattern: [20, 20, 20] },
];

const VibrationTester: React.FC = () => {
  // تابعی برای اجرای الگوی ویبره انتخابی
  const handleTestVibrate = (pattern: number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    } else {
      // این پیام در کامپیوتر نمایش داده می‌شود
      alert("مرورگر شما از ویبره پشتیبانی نمی‌کند.");
    }
  };

  return (
    <div className="mt-8 p-4 bg-gray-700 rounded-2xl">
      <h3 className="text-lg font-bold text-white text-center mb-2">
        ابزار تست ویبره
      </h3>
      <p className="text-xs text-gray-400 text-center mb-4">
        (این ابزار موقتی است. روی دکمه‌ها کلیک کنید تا انواع ویبره را تست کنید)
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {vibrationPatterns.map(({ name, pattern }) => (
          <button
            key={name}
            onClick={() => handleTestVibrate(pattern)}
            className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg active:bg-gray-500 transition-colors"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VibrationTester;
