
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Question, GameState } from './types';
import { defaultQuestions } from './data/questions';
import QuizSetup from './components/QuizSetup';
import QuestionDisplay from './components/QuestionDisplay';
import ResultsScreen from './components/ResultsScreen';
import { goodScoreAnimationData } from './data/goodScoreAnimation';

const INCORRECT_QUESTION_IDS_KEY = 'interactiveQuizIncorrectQuestionIds';

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Utility function to convert numbers to Persian digits
const toPersianDigits = (num: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)]);
};

const CloseIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [masterQuestionList] = useState<Question[]>(() => shuffleArray(defaultQuestions));
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  
  const [persistedIncorrectIds, setPersistedIncorrectIds] = useState<Set<string>>(new Set());
  const [currentSessionIncorrectIds, setCurrentSessionIncorrectIds] = useState<Set<string>>(new Set());
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);

  useEffect(() => {
    const storedIdsRaw = localStorage.getItem(INCORRECT_QUESTION_IDS_KEY);
    if (storedIdsRaw) {
      try {
        const storedIds = JSON.parse(storedIdsRaw);
        if (Array.isArray(storedIds)) {
          setPersistedIncorrectIds(new Set(storedIds.filter(id => typeof id === 'string')));
        }
      } catch (error) {
        console.error("Failed to parse incorrect question IDs from localStorage:", error);
        localStorage.removeItem(INCORRECT_QUESTION_IDS_KEY); 
      }
    }
  }, []);
  
  const handleRestartQuiz = useCallback(() => {
    setGameState(GameState.SETUP);
  }, []);


  const generateOptions = useCallback((currentQ: Question, currentQuizQuestions: Question[]): string[] => {
    const correctAnswer = currentQ.answer;
    let allPossibleAnswers = masterQuestionList.map(q => q.answer);
    if (allPossibleAnswers.length < 4) { 
        allPossibleAnswers = currentQuizQuestions.map(q => q.answer);
    }

    const uniqueDistractors = Array.from(new Set(allPossibleAnswers.filter(ans => ans !== correctAnswer)));
    
    const shuffledDistractors = shuffleArray(uniqueDistractors);
    const distractors = shuffledDistractors.slice(0, 3);

    let options = shuffleArray([correctAnswer, ...distractors]);
    
    while (options.length < 2 && masterQuestionList.length > 1) {
        const randomAnswer = masterQuestionList[Math.floor(Math.random()*masterQuestionList.length)].answer;
        if (!options.includes(randomAnswer)) options.push(randomAnswer);
    }
    if(options.length < 2 && masterQuestionList.length === 1) { 
        options.push("گزینه اضافی ۱"); 
        if(options.length < 2) options.push("گزینه اضافی ۲");
    }
     // Ensure at least 2 options, up to 4
    if (options.length === 1) options.push("گزینه ب"); // Fallback if only one option
    if (options.length === 0) { // Should not happen with current logic, but as safeguard
      options.push("گزینه الف");
      options.push("گزینه ب");
    }

    options = options.slice(0, 4); 

    return shuffleArray(options); 
  }, [masterQuestionList]);

  const startQuizInternal = useCallback((questionsToPlay: Question[], reviewMode: boolean) => {
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
    setCurrentOptions(generateOptions(shuffledQuestions[0], shuffledQuestions));
    setIsReviewMode(reviewMode);
    setCurrentSessionIncorrectIds(new Set());
    setGameState(GameState.QUIZ);
  }, [generateOptions]);

  const handleStartNewQuiz = useCallback(() => {
    startQuizInternal(masterQuestionList, false);
  }, [masterQuestionList, startQuizInternal]);

  const handleStartReviewQuiz = useCallback(() => {
    const incorrectQuestions = masterQuestionList.filter(q => persistedIncorrectIds.has(q.id));
    if (incorrectQuestions.length === 0) {
      alert("شما سوال غلطی برای مرور ندارید!");
      return;
    }
    startQuizInternal(incorrectQuestions, true);
  }, [masterQuestionList, persistedIncorrectIds, startQuizInternal]);

  const handleAnswerSelect = useCallback((answer: string) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);
    const currentQ = questions[currentQuestionIndex];

    if (answer === currentQ.answer) {
      setScore(prevScore => prevScore + 1);
      if (isReviewMode) {
        // Optimistically remove from current session review mistakes
        setCurrentSessionIncorrectIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentQ.id); // If it was marked wrong in this review session, then corrected
          return newSet;
        });
         // Also update the persisted list immediately if corrected in review mode
         setPersistedIncorrectIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentQ.id);
          localStorage.setItem(INCORRECT_QUESTION_IDS_KEY, JSON.stringify(Array.from(newSet)));
          return newSet;
        });
      }
    } else {
      // Mark as incorrect for this session (relevant for non-review mode saving, or if review mode tracks its own mistakes)
      setCurrentSessionIncorrectIds(prev => new Set(prev).add(currentQ.id));
    }
  }, [showFeedback, questions, currentQuestionIndex, isReviewMode]);

  const handleNextQuestion = useCallback(() => {
    setShowFeedback(false);
    setSelectedAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentOptions(generateOptions(questions[nextIndex], questions));
    } else {
      // Quiz finished
      if (!isReviewMode) {
        // Only update persisted incorrect IDs if it's not a review session
        const combinedIncorrectIds = new Set([...persistedIncorrectIds, ...currentSessionIncorrectIds]);
        localStorage.setItem(INCORRECT_QUESTION_IDS_KEY, JSON.stringify(Array.from(combinedIncorrectIds)));
        setPersistedIncorrectIds(combinedIncorrectIds);
      } else {
        // For review mode, if any questions were still answered incorrectly during the review session,
        // they should remain in persistedIncorrectIds.
        // The current logic in handleAnswerSelect already removes correctly answered review questions.
        // So, persistedIncorrectIds should be accurate.
      }
      setGameState(GameState.RESULTS);
    }
  }, [currentQuestionIndex, questions, generateOptions, isReviewMode, persistedIncorrectIds, currentSessionIncorrectIds]);


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
        if (!currentQuestion) return <p className="text-center p-8">در حال بارگذاری سوالات...</p>;
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
            onRestart={handleRestartQuiz} // This should reset to SETUP
            onStartGlobalReviewQuiz={handleStartReviewQuiz} // This starts a review quiz
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
          {/* Container for progress bar and close button */}
          <div className="flex items-center justify-between w-full h-10">
            {/* Close button (now first for RTL, so it appears on the right) */}
            <button
              onClick={handleRestartQuiz}
              className="p-1.5 bg-slate-700/80 backdrop-blur-sm hover:bg-slate-600/80 text-slate-300 hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500 shrink-0"
              aria-label="بستن آزمون و بازگشت به شروع"
            >
              <CloseIcon className="h-4 w-4" /> {/* Icon size h-4 w-4 (1rem) */}
            </button>

            {/* Progress bar container */}
            <div className="flex-grow mx-2">
              <div
                className="bg-slate-700/80 backdrop-blur-sm rounded-full h-2.5 shadow-lg w-full max-w-xs mx-auto" // max-w-xs to control width and allow centering
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`پیشرفت آزمون: ${toPersianDigits(Math.round(progress))}%`}
              >
                <div
                  className="bg-[#2FB5FA] h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            {/* Left invisible spacer in RTL (was right spacer in LTR) - width approx same as close button + padding */}
            <div className="w-7 shrink-0"></div> {/* w-7 approx (1.5rem button + 0.25rem padding each side) */}
          </div>
        </div>
      )}
      
      <main className="w-full max-w-xl mx-auto space-y-6 pt-20 sm:pt-24 pb-28 px-4 flex-grow flex flex-col">
        <div className="p-5 sm:p-6 rounded-2xl flex-grow flex flex-col">
          {renderContent()}
        </div>
        
        {/* Question counter removed from here */}
      </main>
    </div>
  );
};

export default App;
