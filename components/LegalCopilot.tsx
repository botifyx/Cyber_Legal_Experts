import React, { useState, useCallback } from 'react';
import { generateLegalActionPlan } from '../services/geminiService';
import { CompassIcon, LoadingIcon } from './icons';
import { useLanguage } from './LanguageContext';
import { SUPPORTED_LANGUAGES } from '../services/localizationService';

const LegalCopilot: React.FC = () => {
    const [caseDetails, setCaseDetails] = useState<string>('');
    const [plan, setPlan] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { t, language } = useLanguage();

    const handleGeneratePlan = useCallback(async () => {
        if (!caseDetails.trim()) {
            setError('Please provide details about your situation.');
            return;
        }

        setIsLoading(true);
        setPlan('');
        setError('');

        try {
            const langName = SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || 'English';
            const result = await generateLegalActionPlan(caseDetails, langName);
            setPlan(result);
        } catch (err) {
            setError('An error occurred while generating the plan.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [caseDetails, language]);

    return (
        <div className="max-w-4xl mx-auto p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
            <div className="text-center mb-6">
                <CompassIcon className="mx-auto h-12 w-12 text-dynamic" />
                <h2 className="mt-2 text-2xl font-semibold text-slate-100">{t("copilot.title")}</h2>
                <p className="mt-1 text-sm text-slate-400">{t("copilot.subtitle")}</p>
            </div>

            <div className="space-y-4 mb-6">
                <label htmlFor="case-details" className="block text-sm font-medium text-slate-300">
                    {t("copilot.label")}
                </label>
                <textarea
                    id="case-details"
                    rows={6}
                    value={caseDetails}
                    onChange={(e) => setCaseDetails(e.target.value)}
                    placeholder={t("copilot.placeholder")}
                    className="w-full bg-slate-700 text-slate-200 placeholder-slate-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color)] custom-scrollbar"
                />
            </div>
            
            <div className="text-center">
                 <button
                    onClick={handleGeneratePlan}
                    disabled={isLoading}
                    className="bg-[color:var(--secondary-color)] hover:bg-[color:var(--primary-color)] text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center w-full sm:w-auto mx-auto"
                >
                    {isLoading ? <LoadingIcon className="w-5 h-5"/> : t("copilot.btn")}
                </button>
            </div>
            
            {error && <p className="text-red-400 text-center text-sm mt-4">{error}</p>}

            {plan && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">{t("copilot.results")}</h3>
                    <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 max-h-96 overflow-y-auto custom-scrollbar">
                        <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{plan}</pre>
                    </div>
                     <p className="text-xs text-slate-500 mt-2 text-center">{t("copilot.disclaimer")}</p>
                </div>
            )}
        </div>
    );
};

export default LegalCopilot;