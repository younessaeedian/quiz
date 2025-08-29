// components/CourseSelection.tsx

import React from "react";
import { quizzes } from "../data/quizzes";

interface CourseSelectionProps {
  onSelectCourse: (courseId: string) => void;
}

const CourseSelection: React.FC<CourseSelectionProps> = ({
  onSelectCourse,
}) => {
  return (
    <div className="flex-grow flex flex-col justify-center h-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          آزمون خود را انتخاب کنید
        </h1>
      </div>
      <div className="space-y-4">
        {Object.values(quizzes).map((quiz) => (
          <button
            key={quiz.info.id}
            onClick={() => onSelectCourse(quiz.info.id)}
            className="w-full text-center font-bold rounded-2xl py-4 px-6 sm:px-8 text-base sm:text-lg bg-[#202F36] text-gray-100 border-2 border-[#38464F] hover:bg-[#38464F] transition-colors"
          >
            {quiz.info.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CourseSelection;
