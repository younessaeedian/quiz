// App.tsx

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  Suspense,
  lazy,
} from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import {
  Question,
  DescriptiveQuestion,
  GameState,
  QuizMode,
  QuizData,
} from "./types";
import { quizzes } from "./data/quizzes";
import CourseSelection from "./components/CourseSelection";
import QuizSetup from "./components/QuizSetup";
import QuestionDisplay from "./components/QuestionDisplay";
import DescriptiveQuestionDisplay from "./components/DescriptiveQuestionDisplay";

const ResultsScreen = lazy(() => import("./components/ResultsScreen"));

const INCORRECT_QUESTION_IDS_KEY_PREFIX =
  "interactiveQuizIncorrectQuestionIds_";

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const toPersianDigits = (num: string | number): string => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(
    /[0-9]/g,
    (digit) => persianDigits[parseInt(digit)]
  );
};

const CloseIcon: React.FC<{ className?: string }> = ({
  className = "h-5 w-5",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(
    GameState.COURSE_SELECTION
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState<QuizMode | null>(null);
  const [questions, setQuestions] = useState<
    (Question | DescriptiveQuestion)[]
  >([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);

  const [persistedIncorrectIds, setPersistedIncorrectIds] = useState<
    Set<string>
  >(new Set());
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);

  const correctSound = useMemo(
    () => new Audio("/sound/gp_correct_sound.mp3"),
    []
  );
  const incorrectSound = useMemo(
    () => new Audio("/sound/gp_incorrect_sound.mp3"),
    []
  );

  const incorrectQuestionIdsKey = useMemo(
    () =>
      selectedCourseId
        ? `${INCORRECT_QUESTION_IDS_KEY_PREFIX}${selectedCourseId}`
        : null,
    [selectedCourseId]
  );

  const playSound = (audio: HTMLAudioElement) => {
    audio.currentTime = 0;
    audio.play().catch((error) => console.error("Error playing sound:", error));
  };

  useEffect(() => {
    if (!incorrectQuestionIdsKey) return;
    const storedIdsRaw = localStorage.getItem(incorrectQuestionIdsKey);
    if (storedIdsRaw) {
      try {
        const storedIds = JSON.parse(storedIdsRaw);
        if (Array.isArray(storedIds)) {
          setPersistedIncorrectIds(
            new Set(storedIds.filter((id) => typeof id === "string"))
          );
        }
      } catch (error) {
        console.error(
          "Failed to parse incorrect question IDs from localStorage:",
          error
        );
        localStorage.removeItem(incorrectQuestionIdsKey);
      }
    } else {
      setPersistedIncorrectIds(new Set());
    }
  }, [incorrectQuestionIdsKey]);

  const handleSelectCourse = useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
    setGameState(GameState.SETUP);
  }, []);

  const handleBackToCourseSelection = useCallback(() => {
    setGameState(GameState.COURSE_SELECTION);
    setSelectedCourseId(null);
  }, []);

  const handleRestartQuiz = useCallback(() => {
    setGameState(GameState.SETUP);
    setQuizMode(null);
  }, []);

  const startQuizInternal = useCallback(
    (
      questionsToPlay: (Question | DescriptiveQuestion)[],
      mode: QuizMode,
      reviewMode: boolean
    ) => {
      if (questionsToPlay.length === 0) {
        alert("سوالی برای این آزمون یافت نشد.");
        setGameState(GameState.SETUP);
        return;
      }
      const shuffledQuestions = shuffleArray(questionsToPlay);
      setQuestions(shuffledQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setShowFeedback(false);
      if (mode === QuizMode.MULTIPLE_CHOICE) {
        setCurrentOptions(
          shuffleArray((shuffledQuestions[0] as Question).options)
        );
      }
      setIsReviewMode(reviewMode);
      setQuizMode(mode);
      setGameState(GameState.QUIZ);
    },
    []
  );

  const handleStartNewQuiz = useCallback(
    (mode: QuizMode) => {
      if (!selectedCourseId) return;
      const currentQuizData = quizzes[selectedCourseId];
      const questionSet =
        mode === QuizMode.MULTIPLE_CHOICE
          ? currentQuizData.questions
          : currentQuizData.descriptiveQuestions;
      startQuizInternal(questionSet, mode, false);
    },
    [selectedCourseId, startQuizInternal]
  );

  const handleStartReviewQuiz = useCallback(() => {
    if (!selectedCourseId) return;
    const currentQuizData = quizzes[selectedCourseId];
    const incorrectQuestions = currentQuizData.questions.filter((q) =>
      persistedIncorrectIds.has(q.id)
    );
    if (incorrectQuestions.length === 0) {
      alert("شما سوال غلطی برای مرور ندارید!");
      return;
    }
    startQuizInternal(incorrectQuestions, QuizMode.MULTIPLE_CHOICE, true);
  }, [persistedIncorrectIds, selectedCourseId, startQuizInternal]);

  const handleAnswerSelect = useCallback(
    (answer: string) => {
      if (showFeedback || !incorrectQuestionIdsKey) return;

      setSelectedAnswer(answer);
      setShowFeedback(true);
      const currentQ = questions[currentQuestionIndex] as Question;

      if (answer === currentQ.answer) {
        playSound(correctSound);
        setScore((prevScore) => prevScore + 1);
        if (isReviewMode) {
          setPersistedIncorrectIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(currentQ.id);
            localStorage.setItem(
              incorrectQuestionIdsKey,
              JSON.stringify(Array.from(newSet))
            );
            return newSet;
          });
        }
      } else {
        playSound(incorrectSound);
        if (!isReviewMode) {
          setPersistedIncorrectIds((prev) => {
            const newSet = new Set(prev);
            newSet.add(currentQ.id);
            localStorage.setItem(
              incorrectQuestionIdsKey,
              JSON.stringify(Array.from(newSet))
            );
            return newSet;
          });
        }
      }
    },
    [
      showFeedback,
      questions,
      currentQuestionIndex,
      isReviewMode,
      correctSound,
      incorrectSound,
      incorrectQuestionIdsKey,
    ]
  );

  const handleNextQuestion = useCallback(() => {
    setShowFeedback(false);
    setSelectedAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      if (quizMode === QuizMode.MULTIPLE_CHOICE) {
        setCurrentOptions(
          shuffleArray((questions[nextIndex] as Question).options)
        );
      }
    } else {
      if (quizMode === QuizMode.MULTIPLE_CHOICE) {
        setGameState(GameState.RESULTS);
      } else {
        // For descriptive quiz, just go back to setup
        handleRestartQuiz();
      }
    }
  }, [currentQuestionIndex, questions, quizMode, handleRestartQuiz]);

  const currentQuizData: QuizData | null = useMemo(() => {
    return selectedCourseId ? quizzes[selectedCourseId] : null;
  }, [selectedCourseId]);

  const currentQuestion = useMemo(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      return questions[currentQuestionIndex];
    }
    return null;
  }, [questions, currentQuestionIndex]);

  const renderContent = () => {
    switch (gameState) {
      case GameState.COURSE_SELECTION:
        return <CourseSelection onSelectCourse={handleSelectCourse} />;
      case GameState.SETUP:
        if (!currentQuizData) return null;
        return (
          <QuizSetup
            quizInfo={currentQuizData.info}
            onStartNewQuiz={handleStartNewQuiz}
            onStartReviewQuiz={handleStartReviewQuiz}
            incorrectQuestionsCount={persistedIncorrectIds.size}
            onBack={handleBackToCourseSelection}
          />
        );
      case GameState.QUIZ:
        if (!currentQuestion)
          return <p className="text-center p-8">در حال بارگذاری سوالات...</p>;
        if (quizMode === QuizMode.MULTIPLE_CHOICE) {
          return (
            <QuestionDisplay
              question={currentQuestion as Question}
              options={currentOptions}
              onAnswerSelect={handleAnswerSelect}
              selectedAnswer={selectedAnswer}
              showFeedback={showFeedback}
              onNextQuestion={handleNextQuestion}
              currentQuestionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
            />
          );
        } else if (quizMode === QuizMode.DESCRIPTIVE) {
          return (
            <DescriptiveQuestionDisplay
              question={currentQuestion as DescriptiveQuestion}
              onNextQuestion={handleNextQuestion}
              onRestart={handleRestartQuiz}
              currentQuestionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
            />
          );
        }
        return null;
      case GameState.RESULTS:
        return (
          <Suspense
            fallback={
              <div className="flex-grow flex items-center justify-center">
                <p>درحال آماده‌سازی نتایج...</p>
              </div>
            }
          >
            <ResultsScreen
              score={score}
              totalQuestions={questions.length}
              onRestart={handleRestartQuiz}
              onStartGlobalReviewQuiz={handleStartReviewQuiz}
              globalIncorrectCount={persistedIncorrectIds.size}
            />
          </Suspense>
        );
      default:
        return null;
    }
  };

  const progress = useMemo(() => {
    if (gameState !== GameState.QUIZ || questions.length === 0) return 0;
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  }, [gameState, currentQuestionIndex, questions.length]);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      {gameState === GameState.QUIZ && (
        <header className="fixed top-8 left-4 right-4 z-50">
          <div className="flex items-center justify-between w-full max-w-xl mx-auto h-10">
            <button
              onClick={handleRestartQuiz}
              className="p-1.5 bg-[#202F36] hover:bg-gray-600/80 text-gray-300 hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 shrink-0"
              aria-label="بستن آزمون و بازگشت به شروع"
            >
              <CloseIcon className="w-4 w-4" />
            </button>
            <div className="flex-grow mx-4">
              <div
                className="bg-[#202F36] rounded-full h-2.5 shadow-lg w-full"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`پیشرفت آزمون: ${toPersianDigits(
                  Math.round(progress)
                )}%`}
              >
                <div
                  className="bg-[#49C0F8] h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <div className="w-7 shrink-0"></div>
          </div>
        </header>
      )}

      <main className="w-full max-w-xl mx-auto flex-grow flex flex-col px-4 overflow-x-hidden">
        {renderContent()}
      </main>

      <SpeedInsights />
    </div>
  );
};

export default App;
