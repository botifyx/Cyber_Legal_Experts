import React, { useState, useCallback } from 'react';
import { getCyberLawInfo } from '../services/geminiService';
import { GroundingSource } from '../types';
import { LoadingIcon, LinkIcon, GlobeIcon } from './icons';
import { useLanguage } from './LanguageContext';

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const renderPart = (part: string, i: number) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold text-slate-100">{part.slice(2, -2)}</strong>;
        }
        return part;
    };

    const renderLine = (line: string) => {
        return line.split(/(\*\*.*?\*\*)/g).map(renderPart);
    };

    const lines = content.split('\n');
    const elements = [];
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(<ul key={`ul-${elements.length}`} className="space-y-3 pl-2 mt-2 mb-4">{listItems}</ul>);
            listItems = [];
        }
    };

    lines.forEach((line, index) => {
        if (line.trim() === '') return;

        if (line.match(/^\d+\.\s/)) { 
            flushList();
            elements.push(<h3 key={index} className="text-xl font-semibold text-dynamic mt-6 mb-3 border-b border-slate-700 pb-2">{renderLine(line.replace(/^\d+\.\s/, ''))}</h3>);
        } else if (line.startsWith('### ')) {
            flushList();
            elements.push(<h3 key={index} className="text-xl font-semibold text-dynamic mt-6 mb-3 border-b border-slate-700 pb-2">{renderLine(line.substring(4))}</h3>);
        } else if (line.startsWith('**') && line.endsWith('**')) { 
            flushList();
            elements.push(<h4 key={index} className="text-md font-semibold text-slate-200 mt-5 mb-2">{renderLine(line.slice(2, -2))}</h4>);
        } else if (line.startsWith('* ')) {
            listItems.push(
                <li key={index} className="flex items-start gap-3 text-slate-300 leading-relaxed">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[color:var(--primary-color)] flex-shrink-0"></span>
                    <span>{renderLine(line.substring(2))}</span>
                </li>
            );
        } else {
            flushList();
            elements.push(<p key={index} className="text-slate-300 mb-3 leading-relaxed">{renderLine(line)}</p>);
        }
    });

    flushList();

    return <div>{elements}</div>;
};


const KnowledgeHub: React.FC = () => {
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [result, setResult] = useState<{ content: string; sources: GroundingSource[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { t, language } = useLanguage();

    const REGIONS = [
        { name: t("region.eu"), key: "European Union", emoji: "🇪🇺" },
        { name: t("region.us"), key: "United States", emoji: "🇺🇸" },
        { name: t("region.br"), key: "Brazil", emoji: "🇧🇷" },
        { name: t("region.in"), key: "India", emoji: "🇮🇳" },
        { name: t("region.jp"), key: "Japan", emoji: "🇯🇵" },
        { name: t("region.au"), key: "Australia", emoji: "🇦🇺" },
    ];

    const handleSelectRegion = useCallback(async (regionKey: string, regionName: string) => {
        setSelectedRegion(regionName);
        setIsLoading(true);
        setResult(null);
        setError('');

        try {
            // Pass the current language name to the service for localized AI response
            const langName = language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : language === 'ja' ? 'Japanese' : language === 'pt' ? 'Portuguese' : 'English';
            const response = await getCyberLawInfo(regionKey, langName);
            setResult(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [language]);

    const handleBack = () => {
        setSelectedRegion(null);
        setResult(null);
        setError('');
    };

    if (selectedRegion) {
        return (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-100">
                           {t("knowledge.overview")}: <span className="text-dynamic">{selectedRegion}</span>
                        </h2>
                        <p className="mt-1 text-slate-400">{t("knowledge.subtitle")}</p>
                    </div>
                    <button onClick={handleBack} className="mt-3 sm:mt-0 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0">
                        &larr; <span>{t("knowledge.back")}</span>
                    </button>
                </div>


                {isLoading && (
                    <div className="text-center p-8">
                        <LoadingIcon className="w-8 h-8 mx-auto text-dynamic" />
                        <p className="mt-2 text-slate-400">{t("knowledge.fetch")}</p>
                    </div>
                )}
                
                {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}

                {result && (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-slate-900 rounded-lg border border-slate-700 p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                           <MarkdownRenderer content={result.content} />
                        </div>

                        <div className="lg:col-span-1 space-y-6">
                            {result.sources.length > 0 && (
                                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                                    <h4 className="text-lg font-semibold text-slate-100 mb-3">{t("knowledge.sources")}</h4>
                                    <div className="space-y-3">
                                        {result.sources.map((source, index) => source.web && (
                                            <a
                                                key={index}
                                                href={source.web.uri}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-slate-800 p-3 rounded-lg hover:bg-slate-700/70 transition-colors flex items-start gap-3 border border-slate-700 hover:border-[color:var(--primary-color)]"
                                            >
                                                <LinkIcon className="w-4 h-4 text-dynamic mt-1 flex-shrink-0" />
                                                <div className="flex-grow">
                                                    <p className="text-sm font-medium text-slate-200 line-clamp-2">{source.web.title}</p>
                                                    <p className="text-xs text-slate-500 truncate">{new URL(source.web.uri).hostname}</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg text-center">
                                <p className="text-sm text-yellow-300">
                                    <strong>{t("knowledge.disclaimer")}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
            <div className="text-center mb-10">
                <GlobeIcon className="mx-auto h-12 w-12 text-dynamic" />
                <h2 className="mt-2 text-3xl font-bold text-slate-100">{t("knowledge.title")}</h2>
                <p className="mt-2 max-w-2xl mx-auto text-slate-400">
                    {t("knowledge.subtitle")}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {REGIONS.map(region => (
                    <button
                        key={region.key}
                        onClick={() => handleSelectRegion(region.key, region.name)}
                        className="p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-[color:var(--primary-color)] hover:bg-slate-700 transition-all duration-300 flex flex-col items-center gap-3 group"
                    >
                        <span className="text-5xl group-hover:scale-110 transition-transform">{region.emoji}</span>
                        <span className="font-semibold text-slate-200 text-center">{region.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default KnowledgeHub;