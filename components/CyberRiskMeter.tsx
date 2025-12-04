
import React, { useState, useCallback } from 'react';
import { assessCyberRisk } from '../services/geminiService';
import { CyberRiskAssessment, IdentifiedRisk } from '../types';
import { GaugeIcon, LoadingIcon, AlertTriangleIcon, ListChecksIcon } from './icons';
import { useLanguage } from './LanguageContext';
import { SUPPORTED_LANGUAGES } from '../services/localizationService';

// --- Sub-component for the Gauge --- //
interface GaugeProps {
    score: number; // 0-100
}

const Gauge: React.FC<GaugeProps> = ({ score }) => {
    const getRiskColor = (s: number) => {
        if (s <= 33) return '#4ade80'; // green-400
        if (s <= 66) return '#facc15'; // yellow-400
        return '#f87171'; // red-400
    };

    const percentage = Math.max(0, Math.min(100, score)) / 100;
    const angle = percentage * 180; // 0 to 180 degrees
    const color = getRiskColor(score);

    return (
        <div className="relative w-64 h-32">
            <svg viewBox="0 0 100 50" className="w-full h-full">
                {/* Background Arc */}
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" strokeWidth="10" className="stroke-slate-700" strokeLinecap="round" />
                {/* Foreground Arc */}
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" strokeWidth="10" strokeDasharray="125.6" strokeDashoffset={125.6 * (1 - percentage)} strokeLinecap="round" style={{ stroke: color, transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.5s ease-in-out' }} />
            </svg>
            <div 
                className="absolute bottom-2 left-1/2 w-0.5 h-10 bg-slate-200 origin-bottom" 
                style={{ 
                    transform: `translateX(-50%) rotate(${angle - 90}deg)`, 
                    transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
                }}
            >
                 <div className="w-2 h-2 bg-slate-200 rounded-full absolute -top-1 -left-1"></div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <span className="text-4xl font-bold text-slate-100">{score}</span>
                <span className="text-sm text-slate-400 block -mt-1">/ 100</span>
            </div>
        </div>
    );
};


// --- Main Component --- //
const CyberRiskMeter: React.FC = () => {
    const [input, setInput] = useState<string>('');
    const [result, setResult] = useState<CyberRiskAssessment | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { t, language } = useLanguage();

    const handleAssess = useCallback(async () => {
        if (!input.trim()) {
            setError('Please paste the text you want to analyze.');
            return;
        }

        setIsLoading(true);
        setResult(null);
        setError('');

        try {
            const langName = SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || 'English';
            const assessment = await assessCyberRisk(input, langName);
            setResult(assessment);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during assessment.');
        } finally {
            setIsLoading(false);
        }
    }, [input, language]);

    const getRiskStyling = (level: CyberRiskAssessment['riskLevel']) => {
        switch (level) {
            case 'Low': return {
                classNames: 'text-green-400 bg-green-900/50 border-green-700',
                styles: { boxShadow: '0 0 12px rgba(74, 222, 128, 0.5)' }
            };
            case 'Medium': return {
                classNames: 'text-yellow-400 bg-yellow-900/50 border-yellow-700',
                styles: { boxShadow: '0 0 12px rgba(250, 204, 21, 0.5)' }
            };
            case 'High': return {
                classNames: 'text-orange-400 bg-orange-900/50 border-orange-700',
                styles: { boxShadow: '0 0 12px rgba(251, 146, 60, 0.5)' }
            };
            case 'Critical': return {
                classNames: 'text-red-400 bg-red-900/50 border-red-700',
                styles: { boxShadow: '0 0 12px rgba(248, 113, 113, 0.5)' }
            };
            default: return {
                classNames: 'text-slate-400 bg-slate-800 border-slate-700',
                styles: {}
            };
        }
    };

    return (
        <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
            <div className="text-center mb-6">
                <GaugeIcon className="mx-auto h-12 w-12 text-cyan-400" />
                <h2 className="mt-2 text-2xl font-semibold text-slate-100">{t("riskmeter.title")}</h2>
                <p className="mt-1 text-sm text-slate-400">{t("riskmeter.subtitle")}</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4 mb-6">
                <textarea
                    rows={8}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t("riskmeter.placeholder")}
                    className="w-full bg-slate-700 text-slate-200 placeholder-slate-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
                />
                <div className="text-center">
                    <button
                        onClick={handleAssess}
                        disabled={isLoading}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center w-full sm:w-auto mx-auto"
                    >
                        {isLoading ? <LoadingIcon className="w-5 h-5" /> : t("riskmeter.btn")}
                    </button>
                </div>
            </div>

            {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}
            
            {result && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold text-slate-100 mb-6 text-center">{t("riskmeter.results")}</h3>
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mb-8 p-6 bg-slate-900 rounded-lg border border-slate-700">
                        <Gauge score={result.riskScore} />
                        <div className="text-center lg:text-left">
                            <p className="text-lg text-slate-300">{t("riskmeter.level")}</p>
                            <p 
                                className={`text-3xl font-bold px-3 py-1 rounded-md inline-block border transition-all ${getRiskStyling(result.riskLevel).classNames}`}
                                style={getRiskStyling(result.riskLevel).styles}
                            >
                                {result.riskLevel}
                            </p>
                            <p className="mt-2 text-slate-400 max-w-md">{result.summary}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {result.identifiedRisks.map((item, index) => (
                            <div key={index} className="bg-slate-900 rounded-lg border border-slate-700 p-4">
                                <div className="flex items-start gap-3 mb-2">
                                    <div className="p-1.5 bg-red-900/50 rounded-full mt-1">
                                       <AlertTriangleIcon className="w-5 h-5 text-red-400"/>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-red-400">{t("riskmeter.risk")}</h4>
                                        <p className="text-sm text-slate-300">{item.risk}</p>
                                    </div>
                                </div>
                                 <div className="flex items-start gap-3 mt-4 border-t border-slate-700 pt-3">
                                    <div className="p-1.5 bg-green-900/50 rounded-full mt-1">
                                        <ListChecksIcon className="w-5 h-5 text-green-400"/>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-green-400">{t("riskmeter.rec")}</h4>
                                        <p className="text-sm text-slate-300">{item.recommendation}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CyberRiskMeter;
