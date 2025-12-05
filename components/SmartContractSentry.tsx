
import React, { useState, useCallback } from 'react';
import { auditSmartContract } from '../services/geminiService';
import { ContractAudit, Vulnerability } from '../types';
import { ShieldCheckIcon, AlertTriangleIcon, LoadingIcon, FileTextIcon, ListChecksIcon } from './icons';
import { useLanguage } from './LanguageContext';
import { SUPPORTED_LANGUAGES } from '../services/localizationService';

const SmartContractSentry: React.FC = () => {
    const [code, setCode] = useState<string>('');
    const [result, setResult] = useState<ContractAudit | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { t, language } = useLanguage();

    const handleAudit = useCallback(async () => {
        if (!code.trim()) {
            setError('Please paste the smart contract code.');
            return;
        }

        setIsLoading(true);
        setResult(null);
        setError('');

        try {
            const langName = SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || 'English';
            const auditResult = await auditSmartContract(code, langName);
            setResult(auditResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during audit.');
        } finally {
            setIsLoading(false);
        }
    }, [code, language]);

    const getSeverityColor = (severity: Vulnerability['severity']) => {
        switch (severity) {
            case 'Critical': return 'text-red-500 bg-red-900/30 border-red-700';
            case 'High': return 'text-orange-500 bg-orange-900/30 border-orange-700';
            case 'Medium': return 'text-yellow-500 bg-yellow-900/30 border-yellow-700';
            case 'Low': return 'text-green-500 bg-green-900/30 border-green-700';
        }
    };

    return (
        <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
            <div className="text-center mb-6">
                <ShieldCheckIcon className="mx-auto h-12 w-12 text-dynamic" />
                <h2 className="mt-2 text-2xl font-semibold text-slate-100">{t("sentry.title")}</h2>
                <p className="mt-1 text-sm text-slate-400">{t("sentry.subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
                    <textarea
                        rows={16}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={t("sentry.placeholder")}
                        className="w-full h-full min-h-[400px] bg-slate-900 text-green-400 font-mono text-sm placeholder-slate-600 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color)] custom-scrollbar border border-slate-700"
                        spellCheck={false}
                    />
                </div>
                
                <div className="flex flex-col gap-4">
                     <div className="flex-grow bg-slate-900 rounded-lg border border-slate-700 p-6 flex flex-col items-center justify-center text-center">
                        {!result && !isLoading && (
                            <div className="text-slate-500">
                                <FileTextIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p>{t("sentry.subtitle")}</p>
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                     <div className="w-20 h-20 border-4 border-slate-700 rounded-full animate-spin border-t-[color:var(--primary-color)]"></div>
                                     <ShieldCheckIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-dynamic" />
                                </div>
                                <p className="mt-4 text-dynamic animate-pulse font-mono">SCANNING BLOCKCHAIN CODE...</p>
                            </div>
                        )}

                        {result && (
                            <div className="w-full h-full flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                                    <span className="text-lg font-semibold text-slate-200">{t("sentry.score")}</span>
                                    <span className={`text-4xl font-bold ${result.securityScore > 80 ? 'text-green-400' : result.securityScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {result.securityScore}/100
                                    </span>
                                </div>
                                
                                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-left">
                                    <h4 className="font-semibold text-slate-200 mb-2 border-b border-slate-700 pb-2">Executive Summary</h4>
                                    <p className="text-sm text-slate-300">{result.summary}</p>
                                </div>

                                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-left">
                                     <h4 className="font-semibold text-slate-200 mb-2 border-b border-slate-700 pb-2">{t("sentry.legal")}</h4>
                                     <ul className="list-disc pl-5 space-y-1">
                                        {result.legalRisks.map((risk, i) => (
                                            <li key={i} className="text-sm text-slate-300">{risk}</li>
                                        ))}
                                     </ul>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleAudit}
                        disabled={!code.trim() || isLoading}
                        className="bg-[color:var(--secondary-color)] hover:bg-[color:var(--primary-color)] text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-dynamic"
                    >
                        {isLoading ? <LoadingIcon className="w-5 h-5"/> : <><ShieldCheckIcon className="w-5 h-5" /><span>{t("sentry.btn")}</span></>}
                    </button>
                </div>
            </div>

            {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}
            
            {result && result.vulnerabilities.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-xl font-semibold text-slate-100 mb-4">{t("sentry.critical")}</h3>
                    <div className="space-y-4">
                        {result.vulnerabilities.map((vuln, index) => (
                            <div key={index} className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-[color:var(--primary-color)] transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-200 flex items-center gap-2">
                                        <AlertTriangleIcon className={`w-5 h-5 ${getSeverityColor(vuln.severity).split(' ')[0]}`} />
                                        {vuln.name}
                                    </h4>
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase border ${getSeverityColor(vuln.severity)}`}>
                                        {vuln.severity}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 mb-1">Line: {vuln.line || 'N/A'}</p>
                                <p className="text-sm text-slate-300">{vuln.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartContractSentry;
