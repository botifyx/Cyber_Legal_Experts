
import React, { useState, useCallback } from 'react';
import { predictPrecedent } from '../services/geminiService';
import { PrecedentPrediction, PredictedOutcome } from '../types';
import { ScaleIcon, LoadingIcon, GavelIcon, BookOpenIcon, LightbulbIcon } from './icons';
import { useLanguage } from './LanguageContext';
import { SUPPORTED_LANGUAGES } from '../services/localizationService';

// --- Sub-component for Outcome Card --- //
interface OutcomeCardProps {
    outcome: PredictedOutcome;
    t: (key: string) => string;
}
const OutcomeCard: React.FC<OutcomeCardProps> = ({ outcome, t }) => {
    const getConfidenceColor = (score: PredictedOutcome['confidenceScore']) => {
        switch (score) {
            case 'High': return 'text-green-400';
            case 'Medium': return 'text-yellow-400';
            case 'Low': return 'text-orange-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
            <div className="flex justify-between items-start">
                <h4 className="font-semibold text-slate-100">{outcome.outcome}</h4>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-slate-700 ${getConfidenceColor(outcome.confidenceScore)}`}>
                    {outcome.confidenceScore} {t("predictor.confidence")}
                </span>
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-cyan-400">{t("predictor.likelihood")}</span>
                    <span className="text-sm font-semibold text-slate-200">{outcome.likelihoodPercentage}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                        className="bg-cyan-500 h-2 rounded-full"
                        style={{ width: `${outcome.likelihoodPercentage}%`, transition: 'width 0.5s ease-in-out' }}
                    ></div>
                </div>
            </div>
            <p className="text-xs text-slate-400 pt-2 border-t border-slate-700">{outcome.reasoning}</p>
        </div>
    );
};

// --- Main Component --- //
const PrecedentPredictor: React.FC = () => {
    const [caseDetails, setCaseDetails] = useState<string>('');
    const [prediction, setPrediction] = useState<PrecedentPrediction | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { t, language } = useLanguage();

    const handlePredict = useCallback(async () => {
        if (!caseDetails.trim()) {
            setError('Please provide case details to predict.');
            return;
        }

        setIsLoading(true);
        setPrediction(null);
        setError('');

        try {
            const langName = SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || 'English';
            const result = await predictPrecedent(caseDetails, langName);
            setPrediction(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [caseDetails, language]);

    return (
        <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
            <div className="text-center mb-6">
                <ScaleIcon className="mx-auto h-12 w-12 text-cyan-400" />
                <h2 className="mt-2 text-2xl font-semibold text-slate-100">{t("predictor.title")}</h2>
                <p className="mt-1 text-sm text-slate-400">{t("predictor.subtitle")}</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4 mb-6">
                <textarea
                    rows={8}
                    value={caseDetails}
                    onChange={(e) => setCaseDetails(e.target.value)}
                    placeholder={t("predictor.placeholder")}
                    className="w-full bg-slate-700 text-slate-200 placeholder-slate-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
                />
                <div className="text-center">
                    <button
                        onClick={handlePredict}
                        disabled={isLoading}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center w-full sm:w-auto mx-auto"
                    >
                        {isLoading ? <LoadingIcon className="w-5 h-5" /> : t("predictor.btn")}
                    </button>
                </div>
            </div>

            {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}

            {prediction && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold text-slate-100 mb-6 text-center">{t("predictor.dashboard")}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Outcomes */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <GavelIcon className="w-6 h-6 text-cyan-400" />
                                <h4 className="text-lg font-semibold text-cyan-400">{t("predictor.outcomes")}</h4>
                            </div>
                            <div className="space-y-4">
                                {prediction.predictedOutcomes.map((outcome, index) => (
                                    <OutcomeCard key={index} outcome={outcome} t={t} />
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Sections & Strategies */}
                        <div className="space-y-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <BookOpenIcon className="w-6 h-6 text-cyan-400" />
                                    <h4 className="text-lg font-semibold text-cyan-400">{t("predictor.sections")}</h4>
                                </div>
                                <div className="space-y-3">
                                    {prediction.keyLegalSections.map((item, index) => (
                                        <div key={index} className="p-3 bg-slate-800/50 rounded-md border border-slate-700">
                                            <p className="font-semibold text-sm text-slate-200">{item.section}</p>
                                            <p className="text-xs text-slate-400">{item.relevance}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <LightbulbIcon className="w-6 h-6 text-cyan-400" />
                                    <h4 className="text-lg font-semibold text-cyan-400">{t("predictor.strategies")}</h4>
                                </div>
                                <div className="space-y-3">
                                     {prediction.suggestedStrategies.map((item, index) => (
                                        <div key={index} className="p-3 bg-slate-800/50 rounded-md border border-slate-700">
                                            <p className="font-semibold text-sm text-slate-200">{item.strategy}</p>
                                            <p className="text-xs text-slate-400">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-6 text-center">{t("copilot.disclaimer")}</p>
                </div>
            )}
        </div>
    );
};

export default PrecedentPredictor;
