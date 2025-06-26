import React, { useState, useCallback, useMemo, useEffect } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Question, GameState } from "./types";
import { defaultQuestions } from "./data/questions";
import QuizSetup from "./components/QuizSetup";
import QuestionDisplay from "./components/QuestionDisplay";
import ResultsScreen from "./components/ResultsScreen";
import { goodScoreAnimationData } from "./data/goodScoreAnimation";

const INCORRECT_QUESTION_IDS_KEY = "interactiveQuizIncorrectQuestionIds";
const ACTIVE_QUIZ_STATE_KEY = "activeQuizState";

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
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [masterQuestionList] = useState<Question[]>(() =>
    shuffleArray(defaultQuestions)
  );
  const [questions, setQuestions] = useState<Question[]>([]);
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

  const playSound = (audio: HTMLAudioElement) => {
    audio.currentTime = 0;
    audio.play().catch((error) => console.error("Error playing sound:", error));
  };

  useEffect(() => {
    const savedStateJSON = localStorage.getItem(ACTIVE_QUIZ_STATE_KEY);
    if (savedStateJSON) {
      try {
        const savedState = JSON.parse(savedStateJSON);
        if (
          savedState.gameState === GameState.QUIZ &&
          Array.isArray(savedState.questions) &&
          savedState.questions.length > 0
        ) {
          setQuestions(savedState.questions);
          setCurrentQuestionIndex(savedState.currentQuestionIndex);
          setScore(savedState.score || 0);
          setIsReviewMode(savedState.isReviewMode || false);
          setCurrentOptions(
            shuffleArray(
              savedState.questions[savedState.currentQuestionIndex].options
            )
          );
          setGameState(GameState.QUIZ);
        } else {
          localStorage.removeItem(ACTIVE_QUIZ_STATE_KEY);
        }
      } catch (e) {
        console.error("Failed to parse saved state, removing it.", e);
        localStorage.removeItem(ACTIVE_QUIZ_STATE_KEY);
      }
    }

    const storedIdsRaw = localStorage.getItem(INCORRECT_QUESTION_IDS_KEY);
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
        localStorage.removeItem(INCORRECT_QUESTION_IDS_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (gameState === GameState.QUIZ && questions.length > 0) {
      const stateToSave = {
        gameState,
        questions,
        currentQuestionIndex,
        score,
        isReviewMode,
      };
      localStorage.setItem(ACTIVE_QUIZ_STATE_KEY, JSON.stringify(stateToSave));
    }
  }, [gameState, questions, currentQuestionIndex, score, isReviewMode]);

  const handleRestartQuiz = useCallback(() => {
    localStorage.removeItem(ACTIVE_QUIZ_STATE_KEY);
    setGameState(GameState.SETUP);
  }, []);

  const startQuizInternal = useCallback(
    (questionsToPlay: Question[], reviewMode: boolean) => {
      if (questionsToPlay.length === 0) {
        alert("سوالی برای این آزمون یافت نشد.");
        setGameState(GameState.SETUP);
        return;
      }
      localStorage.removeItem(ACTIVE_QUIZ_STATE_KEY);
      const shuffledQuestions = shuffleArray(questionsToPlay);
      setQuestions(shuffledQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setCurrentOptions(shuffleArray(shuffledQuestions[0].options));
      setIsReviewMode(reviewMode);
      setGameState(GameState.QUIZ);
    },
    []
  );

  const handleStartNewQuiz = useCallback(() => {
    startQuizInternal(masterQuestionList, false);
  }, [masterQuestionList, startQuizInternal]);

  const handleStartReviewQuiz = useCallback(() => {
    const incorrectQuestions = masterQuestionList.filter((q) =>
      persistedIncorrectIds.has(q.id)
    );
    if (incorrectQuestions.length === 0) {
      alert("شما سوال غلطی برای مرور ندارید!");
      return;
    }
    startQuizInternal(incorrectQuestions, true);
  }, [masterQuestionList, persistedIncorrectIds, startQuizInternal]);

  const handleAnswerSelect = useCallback(
    (answer: string) => {
      if (showFeedback) return;

      setSelectedAnswer(answer);
      setShowFeedback(true);
      const currentQ = questions[currentQuestionIndex];

      if (answer === currentQ.answer) {
        playSound(correctSound);
        setScore((prevScore) => prevScore + 1);
        if (isReviewMode) {
          setPersistedIncorrectIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(currentQ.id);
            localStorage.setItem(
              INCORRECT_QUESTION_IDS_KEY,
              JSON.stringify(Array.from(newSet))
            );
            return newSet;
          });
        }
      } else {
        playSound(incorrectSound);
        // **تغییر اصلی:** ثبت فوری سوال غلط در آزمون اصلی
        if (!isReviewMode) {
          setPersistedIncorrectIds((prev) => {
            const newSet = new Set(prev);
            newSet.add(currentQ.id);
            localStorage.setItem(
              INCORRECT_QUESTION_IDS_KEY,
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
    ]
  );

  const handleNextQuestion = useCallback(() => {
    setShowFeedback(false);
    setSelectedAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentOptions(shuffleArray(questions[nextIndex].options));
    } else {
      // **تغییر اصلی:** حذف منطق ادغام در انتهای آزمون
      localStorage.removeItem(ACTIVE_QUIZ_STATE_KEY);
      setGameState(GameState.RESULTS);
    }
  }, [currentQuestionIndex, questions]);

  const currentQuestion = useMemo(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      return questions[currentQuestionIndex];
    }
    return null;
  }, [questions, currentQuestionIndex]);

  const renderContent = () => {
    switch (gameState) {
      case GameState.SETUP:
        return (
          <QuizSetup
            onStartNewQuiz={handleStartNewQuiz}
            onStartReviewQuiz={handleStartReviewQuiz}
            incorrectQuestionsCount={persistedIncorrectIds.size}
          />
        );
      case GameState.QUIZ:
        if (!currentQuestion)
          return <p className="text-center p-8">در حال بارگذاری سوالات...</p>;
        return (
          <QuestionDisplay
            question={currentQuestion}
            options={currentOptions}
            onAnswerSelect={handleAnswerSelect}
            selectedAnswer={selectedAnswer}
            showFeedback={showFeedback}
            onNextQuestion={handleNextQuestion}
            currentQuestionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
          />
        );
      case GameState.RESULTS:
        return (
          <ResultsScreen
            score={score}
            totalQuestions={questions.length}
            onRestart={handleRestartQuiz}
            onStartGlobalReviewQuiz={handleStartReviewQuiz}
            globalIncorrectCount={persistedIncorrectIds.size}
            animationData={goodScoreAnimationData}
          />
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
    <div className="min-h-screen text-slate-100 flex flex-col items-center">
      {gameState === GameState.QUIZ && (
        <div className="fixed top-0 left-0 right-0 mt-6 z-50 px-4 fade-in">
          <div className="flex items-center justify-between w-full h-10">
            <button
              onClick={handleRestartQuiz}
              className="p-1.5 bg-[#202F36] hover:bg-gray-600/80 text-gray-300 hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 shrink-0"
              aria-label="بستن آزمون و بازگشت به شروع"
            >
              <CloseIcon className="h-4 w-4" />
            </button>

            <div className="flex-grow mx-2">
              <div
                className="bg-[#202F36] rounded-full h-2.5 shadow-lg w-full max-w-xs mx-auto"
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
        </div>
      )}

      <main className="w-full max-w-xl mx-auto space-y-6 pt-20 sm:pt-24 px-4 flex-grow flex flex-col pb-40">
        <div className="p-5 sm:p-6 rounded-2xl flex-grow flex flex-col">
          {renderContent()}
        </div>
      </main>

      <SpeedInsights />
    </div>
  );
};

export default App;
