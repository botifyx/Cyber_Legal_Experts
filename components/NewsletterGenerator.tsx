import React, { useState, useCallback } from 'react';
import { generateNewsletter } from '../services/geminiService';
import { GroundingSource } from '../types';
import { LoadingIcon, MailIcon, LinkIcon, SearchIcon } from './icons';

interface NewsletterGeneratorProps {
    onBack: () => void;
}

const NewsletterGenerator: React.FC<NewsletterGeneratorProps> = ({ onBack }) => {
    const [region, setRegion] = useState('California');
    const [result, setResult] = useState<{ content: string; sources: GroundingSource[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = useCallback(async () => {
        if (!region.trim()) {
            setError('Please enter a region.');
            return;
        }

        setIsLoading(true);
        setResult(null);
        setError('');

        try {
            const response = await generateNewsletter(region);
            setResult(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [region]);

    return (
        <div className="max-w-4xl w-full mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="text-left">
                    <MailIcon className="h-12 w-12 text-cyan-400" />
                    <h2 className="mt-2 text-2xl font-semibold text-slate-100">AI Legal Newsletter Generator</h2>
                    <p className="mt-1 text-sm text-slate-400">Get a personalized legal newsletter for your specified region.</p>
                </div>
                <button onClick={onBack} className="text-sm font-semibold text-cyan-400 hover:text-cyan-300">
                    &larr; Back to Hub
                </button>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                    <input
                        type="text"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        placeholder="e.g., European Union"
                        className="w-full bg-slate-700 text-slate-200 placeholder-slate-400 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto flex-shrink-0"
                    >
                        {isLoading ? <LoadingIcon className="w-5 h-5"/> : <><SearchIcon className="w-5 h-5" /><span>Generate</span></>}
                    </button>
                </div>

                {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}
                
                {isLoading && !result && (
                    <div className="text-center p-8">
                        <LoadingIcon className="w-8 h-8 mx-auto text-cyan-400" />
                        <p className="mt-2 text-slate-400">Generating your newsletter...</p>
                    </div>
                )}

                {result && (
                    <div className="mt-6 space-y-6">
                        <h3 className="text-xl font-semibold text-slate-100 text-center mb-4">Your Custom Newsletter</h3>
                        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{result.content}</pre>
                        </div>
                        {result.sources.length > 0 && (
                            <div>
                                <h4 className="text-lg font-semibold text-slate-100 mb-2">Sources Used:</h4>
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
        </div>
    );
};

export default NewsletterGenerator;