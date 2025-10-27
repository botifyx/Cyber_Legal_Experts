
import React, { useState, useCallback } from 'react';
import { generateLegalActionPlan } from '../services/geminiService';
import { CompassIcon, LoadingIcon } from './icons';

const LegalCopilot: React.FC = () => {
    const [caseDetails, setCaseDetails] = useState<string>('');
    const [plan, setPlan] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGeneratePlan = useCallback(async () => {
        if (!caseDetails.trim()) {
            setError('Please provide details about your situation.');
            return;
        }

        setIsLoading(true);
        setPlan('');
        setError('');

        try {
            const result = await generateLegalActionPlan(caseDetails);
            setPlan(result);
        } catch (err) {
            setError('An error occurred while generating the plan.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [caseDetails]);

    return (
        <div className="max-w-4xl mx-auto p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
            <div className="text-center mb-6">
                <CompassIcon className="mx-auto h-12 w-12 text-cyan-400" />
                <h2 className="mt-2 text-2xl font-semibold text-slate-100">AI Legal Copilot</h2>
                <p className="mt-1 text-sm text-slate-400">Describe your situation to receive a personalized, step-by-step action plan.</p>
            </div>

            <div className="space-y-4 mb-6">
                <label htmlFor="case-details" className="block text-sm font-medium text-slate-300">
                    Case Details
                </label>
                <textarea
                    id="case-details"
                    rows={6}
                    value={caseDetails}
                    onChange={(e) => setCaseDetails(e.target.value)}
                    placeholder="Describe the incident, parties involved, and your desired outcome. For example: 'I am a small business owner and I suspect a former employee stole our client list...'"
                    className="w-full bg-slate-700 text-slate-200 placeholder-slate-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
                />
            </div>
            
            <div className="text-center">
                 <button
                    onClick={handleGeneratePlan}
                    disabled={isLoading}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center w-full sm:w-auto mx-auto"
                >
                    {isLoading ? <LoadingIcon className="w-5 h-5"/> : 'Generate Action Plan'}
                </button>
            </div>
            
            {error && <p className="text-red-400 text-center text-sm mt-4">{error}</p>}

            {plan && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">Generated Action Plan:</h3>
                    <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 max-h-96 overflow-y-auto custom-scrollbar">
                        <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{plan}</pre>
                    </div>
                     <p className="text-xs text-slate-500 mt-2 text-center">Disclaimer: This is an AI-generated plan for informational purposes only and does not constitute legal advice.</p>
                </div>
            )}
        </div>
    );
};

export default LegalCopilot;
