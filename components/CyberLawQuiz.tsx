import React, { useState, useCallback } from 'react';
import { generateQuizQuestions } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { LoadingIcon, QuizIcon } from './icons';
import { useLanguage } from './LanguageContext';
import { SUPPORTED_LANGUAGES } from '../services/localizationService';

interface CyberLawQuizProps {
    onBack: () => void;
}

const CyberLawQuiz: React.FC<CyberLawQuizProps> = ({ onBack }) => {
    const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isQuizFinished, setIsQuizFinished] = useState(false);
    const { t, language } = useLanguage();

    const handleStartQuiz = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const langName = SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || 'English';
            const questions = await generateQuizQuestions(langName);
            setQuiz(questions);
            setIsQuizFinished(false);
            setCurrentQuestionIndex(0);
            setScore(0);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [language]);
    
    const handleAnswerSelect = (answerIndex: number) => {
        if (isAnswered) return;

        setSelectedAnswer(answerIndex);
        setIsAnswered(true);
        if (answerIndex === quiz[currentQuestionIndex].correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setIsQuizFinished(true);
        }
    };
    
    const handlePlayAgain = () => {
        setQuiz([]);
        setIsQuizFinished(false);
    };

    const renderQuizContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-64">
                    <LoadingIcon className="w-12 h-12 text-dynamic" />
                    <p className="mt-4 text-slate-300">{t("quiz.loading")}</p>
                </div>
            );
        }

        if (error) {
            return <p className="text-red-400 text-center">{error}</p>;
        }
        
        if (isQuizFinished) {
            return (
                 <div className="text-center">
                    <h3 className="text-2xl font-bold text-slate-100">{t("quiz.complete")}</h3>
                    <p className="mt-2 text-lg text-slate-300">{t("quiz.score")} <span className="text-dynamic font-bold">{score}</span> {t("quiz.of")} <span className="font-bold">{quiz.length}</span></p>
                    <button onClick={handlePlayAgain} className="mt-6 bg-[color:var(--secondary-color)] hover:bg-[color:var(--primary-color)] text-white font-bold py-2 px-6 rounded-lg">{t("quiz.play_again")}</button>
                </div>
            )
        }

        if (quiz.length > 0) {
            const question = quiz[currentQuestionIndex];
            return (
                <div>
                    <p className="text-sm text-slate-400 mb-2">{t("quiz.question_count")} {currentQuestionIndex + 1} {t("quiz.of")} {quiz.length}</p>
                    <h3 className="text-lg font-semibold text-slate-100 mb-6">{question.question}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.options.map((option, index) => {
                            const isCorrect = index === question.correctAnswer;
                            const isSelected = index === selectedAnswer;
                            let buttonClass = 'bg-slate-700 hover:bg-slate-600 text-left';
                            if (isAnswered) {
                                if (isCorrect) {
                                    buttonClass = 'bg-green-500/80 text-white';
                                } else if (isSelected) {
                                    buttonClass = 'bg-red-500/80 text-white';
                                } else {
                                    buttonClass = 'bg-slate-700 opacity-60';
                                }
                            }
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={isAnswered}
                                    className={`p-4 rounded-lg transition-all duration-200 ${buttonClass}`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                    {isAnswered && (
                        <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-dynamic">{t("quiz.explanation")}</h4>
                            <p className="mt-1 text-sm text-slate-300">{question.explanation}</p>
                            <div className="text-right mt-4">
                                <button onClick={handleNextQuestion} className="bg-[color:var(--secondary-color)] hover:bg-[color:var(--primary-color)] text-white font-bold py-2 px-4 rounded-lg">
                                    {currentQuestionIndex < quiz.length - 1 ? t("quiz.next") : t("quiz.finish")}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return (
             <div className="text-center">
                <h3 className="text-xl font-bold text-slate-100">{t("quiz.start_prompt")}</h3>
                <p className="mt-2 text-slate-400">{t("quiz.start_desc")}</p>
                <button onClick={handleStartQuiz} className="mt-6 bg-[color:var(--secondary-color)] hover:bg-[color:var(--primary-color)] text-white font-bold py-2 px-6 rounded-lg">{t("quiz.start_btn")}</button>
            </div>
        );
    };

    return (
         <div className="max-w-4xl w-full mx-auto">
             <div className="flex justify-between items-center mb-6">
                <div className="text-left">
                    <QuizIcon className="h-12 w-12 text-dynamic" />
                    <h2 className="mt-2 text-2xl font-semibold text-slate-100">{t("quiz.title")}</h2>
                    <p className="mt-1 text-sm text-slate-400">{t("quiz.subtitle")}</p>
                </div>
                 <button onClick={onBack} className="text-sm font-semibold text-dynamic hover:opacity-80">
                    &larr; {t("quiz.back")}
                </button>
            </div>
             <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 min-h-[30rem] flex items-center justify-center">
                {renderQuizContent()}
             </div>
         </div>
    );
};

export default CyberLawQuiz;