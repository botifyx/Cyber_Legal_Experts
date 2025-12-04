
import React, { useState, useCallback } from 'react';
import { summarizeLegalNews } from '../services/geminiService';
import type { GroundingSource } from '../types';
import { NewspaperIcon, SearchIcon, LoadingIcon, LinkIcon } from './icons';
import { useLanguage } from './LanguageContext';
import { SUPPORTED_LANGUAGES } from '../services/localizationService';

const NewsSummarizer: React.FC = () => {
    const [topic, setTopic] = useState<string>('');
    const [result, setResult] = useState<{ summary: string; sources: GroundingSource[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { t, language } = useLanguage();

    const handleSummarize = useCallback(async () => {
        if (!topic.trim()) {
            setError('Please enter a topic.');
            return;
        }

        setIsLoading(true);
        setResult(null);
        setError('');

        try {
            const langName = SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || 'English';
            const response = await summarizeLegalNews(topic, langName);
            setResult(response);
        } catch (err) {
            setError('An error occurred while fetching the summary.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [topic, language]);

    return (
        <div className="max-w-4xl mx-auto p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
            <div className="text-center mb-6">
                <NewspaperIcon className="mx-auto h-12 w-12 text-cyan-400" />
                <h2 className="mt-2 text-2xl font-semibold text-slate-100">{t("summarizer.title")}</h2>
                <p className="mt-1 text-sm text-slate-400">{t("summarizer.subtitle")}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <div className="relative flex-grow w-full sm:w-auto">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={t("summarizer.placeholder")}
                        className="w-full bg-slate-700 text-slate-200 placeholder-slate-400 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                <button
                    onClick={handleSummarize}
                    disabled={isLoading}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    {isLoading ? <LoadingIcon className="w-5 h-5"/> : <><SearchIcon className="w-5 h-5" /><span>{t("summarizer.btn")}</span></>}
                </button>
            </div>

            {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}

            {result && (
                <div className="mt-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-100 mb-2">{t("summarizer.results")}</h3>
                        <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                            <p className="text-sm text-slate-300 whitespace-pre-wrap">{result.summary}</p>
                        </div>
                    </div>
                     {result.sources.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-2">{t("summarizer.sources")}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {result.sources.map((source, index) => source.web && (
                                    <a
                                        key={index}
                                        href={source.web.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-slate-700 p-3 rounded-lg hover:bg-slate-600 transition-colors flex items-start gap-3"
                                    >
                                        <LinkIcon className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                                        <div className="flex-grow">
                                            <p className="text-sm font-medium text-slate-200 truncate">{source.web.title}</p>
                                            <p className="text-xs text-slate-400 truncate">{source.web.uri}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NewsSummarizer;
