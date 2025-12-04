
import React, { useState, useCallback } from 'react';
import { analyzeCaseDna } from '../services/geminiService';
import { CaseDna, Entity, TimelineEvent } from '../types';
import { DnaIcon, UploadIcon, LoadingIcon, FileTextIcon, UsersIcon, ListChecksIcon, AlertTriangleIcon, XIcon, CalendarIcon } from './icons';
import { useLanguage } from './LanguageContext';
import { SUPPORTED_LANGUAGES } from '../services/localizationService';

// --- Sub-component for Details Modal --- //
interface DetailsModalProps {
    title: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
    onClose: () => void;
}
const DetailsModal: React.FC<DetailsModalProps> = ({ title, icon, content, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" 
            style={{ animation: 'modal-fade-in 0.3s ease-out' }}
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-lg relative p-6"
                style={{ animation: 'modal-content-scale-up 0.3s ease-out' }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <div className="flex items-center justify-between pb-3 border-b border-slate-600">
                    <div className="flex items-center gap-3">
                        {icon}
                        <h3 className="text-lg font-semibold text-cyan-400">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors" aria-label="Close details">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-4 text-sm text-slate-300 custom-scrollbar max-h-[60vh] overflow-y-auto">
                    {content}
                </div>
            </div>
        </div>
    );
};

// --- Main Component --- //
const CaseDnaAnalyzer: React.FC = () => {
    const [input, setInput] = useState<string>('');
    const [result, setResult] = useState<CaseDna | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [modalContent, setModalContent] = useState<{ title: string; icon?: React.ReactNode; content: React.ReactNode } | null>(null);
    const { t, language } = useLanguage();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setInput(e.target?.result as string);
                setResult(null);
                setError('');
            };
            reader.readAsText(file);
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (!input.trim()) {
            setError('Please provide case details or upload a document.');
            return;
        }

        setIsLoading(true);
        setResult(null);
        setError('');

        try {
            const langName = SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || 'English';
            const analysisResult = await analyzeCaseDna(input, langName);
            setResult(analysisResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [input, language]);
    
    // --- Click Handlers for Interactivity --- //
    const handleTimelineClick = (item: TimelineEvent) => {
        setModalContent({
            title: t("casedna.modal.timeline"),
            icon: <CalendarIcon className="w-6 h-6 text-cyan-400" />,
            content: (
                <div className="space-y-2">
                    <p><strong className="font-semibold text-slate-200">Date:</strong> {item.date}</p>
                    <p><strong className="font-semibold text-slate-200">Event:</strong> {item.event}</p>
                </div>
            )
        });
    };

    const handleEntityClick = (entity: Entity) => {
        setModalContent({
            title: t("casedna.modal.entity"),
            icon: <UsersIcon className="w-6 h-6 text-cyan-400" />,
            content: (
                 <div className="space-y-2">
                    <p><strong className="font-semibold text-slate-200">Name:</strong> {entity.name}</p>
                    <p><strong className="font-semibold text-slate-200">Type:</strong> {entity.type}</p>
                    <p><strong className="font-semibold text-slate-200">Description:</strong></p>
                    <p className="whitespace-pre-wrap">{entity.description}</p>
                </div>
            )
        });
    };

    const handleDetailClick = (title: string, detail: string, icon: React.ReactNode) => {
        setModalContent({
            title: `${title} Details`,
            icon: icon,
            content: <p>{detail}</p>
        });
    };

    return (
        <>
            {modalContent && (
                <DetailsModal 
                    title={modalContent.title} 
                    icon={modalContent.icon}
                    content={modalContent.content}
                    onClose={() => setModalContent(null)}
                />
            )}
            <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
                <div className="text-center mb-6">
                    <DnaIcon className="mx-auto h-12 w-12 text-cyan-400" />
                    <h2 className="mt-2 text-2xl font-semibold text-slate-100">{t("casedna.title")}</h2>
                    <p className="mt-1 text-sm text-slate-400">{t("casedna.subtitle")}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <textarea
                        rows={8}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t("casedna.placeholder")}
                        className="w-full bg-slate-700 text-slate-200 placeholder-slate-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
                    />
                    <div className="flex flex-col items-center justify-center gap-4 p-4 bg-slate-800 rounded-lg border border-dashed border-slate-600">
                         <label className="relative cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                            <UploadIcon className="w-5 h-5" />
                            <span>{t("casedna.upload")}</span>
                            <input type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.md" />
                        </label>
                        <p className="text-xs text-slate-500">{t("casedna.or")}</p>
                        <button
                            onClick={handleAnalyze}
                            disabled={!input.trim() || isLoading}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center w-full max-w-xs"
                        >
                            {isLoading ? <LoadingIcon className="w-5 h-5"/> : t("casedna.btn")}
                        </button>
                    </div>
                </div>

                {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}
                
                {result && (
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold text-slate-100 mb-4 text-center">{t("casedna.map")}</h3>
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Timeline */}
                            <div className="flex-shrink-0 lg:w-1/3">
                                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 h-full">
                                    <h4 className="text-lg font-semibold text-cyan-400 mb-4">{t("casedna.timeline")}</h4>
                                    <div className="relative pl-5 space-y-2 border-l border-slate-600">
                                        {result.timeline.map((item, index) => (
                                            <div 
                                                key={index} 
                                                className="relative p-2 rounded-md hover:bg-slate-800 cursor-pointer transition-all duration-200 border border-transparent hover:border-slate-600 transform hover:scale-[1.03] hover:shadow-lg hover:shadow-cyan-500/10"
                                                onClick={() => handleTimelineClick(item)}
                                            >
                                                <div className="absolute -left-[27px] top-4 h-3 w-3 bg-cyan-500 rounded-full border-2 border-slate-900"></div>
                                                <p className="font-semibold text-sm text-slate-200">{item.date}</p>
                                                <p className="text-xs text-slate-400">{item.event}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Other Details */}
                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                                    <h4 className="text-lg font-semibold text-cyan-400 mb-3">{t("casedna.entities")}</h4>
                                    <div className="space-y-2">
                                        {result.entities.map((entity, index) => (
                                            <div 
                                                key={index} 
                                                className="p-2 bg-slate-800 rounded-md hover:bg-slate-700 cursor-pointer transition-all duration-200 border border-transparent hover:border-slate-600 transform hover:scale-[1.03] hover:shadow-lg hover:shadow-cyan-500/10"
                                                onClick={() => handleEntityClick(entity)}
                                            >
                                                <p className="font-bold text-sm text-slate-100">{entity.name} <span className="text-xs font-normal text-slate-400">({entity.type})</span></p>
                                                <p className="text-xs text-slate-300 truncate">{entity.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                 <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                                    <h4 className="text-lg font-semibold text-cyan-400 mb-3">{t("casedna.evidence")}</h4>
                                    <ul className="space-y-2 text-sm text-slate-300">
                                        {result.evidencePatterns.map((pattern, index) => (
                                            <li 
                                                key={index}
                                                className="p-2 rounded-md hover:bg-slate-800 cursor-pointer transition-all duration-200 flex gap-2 border border-transparent hover:border-slate-600 transform hover:scale-[1.03] hover:shadow-lg hover:shadow-cyan-500/10"
                                                onClick={() => handleDetailClick('Evidence Pattern', pattern, <ListChecksIcon className="w-6 h-6 text-cyan-400" />)}
                                            >
                                                <ListChecksIcon className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                                                <span>{pattern}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="md:col-span-2 p-4 bg-slate-900 rounded-lg border border-slate-700">
                                    <h4 className="text-lg font-semibold text-cyan-400 mb-3">{t("casedna.liabilities")}</h4>
                                     <ul className="space-y-2 text-sm text-slate-300">
                                        {result.legalLiabilities.map((liability, index) => (
                                            <li 
                                                key={index}
                                                className="p-2 rounded-md hover:bg-slate-800 cursor-pointer transition-all duration-200 flex gap-2 border border-transparent hover:border-slate-600 transform hover:scale-[1.03] hover:shadow-lg hover:shadow-cyan-500/10"
                                                onClick={() => handleDetailClick('Legal Liability', liability, <AlertTriangleIcon className="w-6 h-6 text-yellow-400" />)}
                                            >
                                                <AlertTriangleIcon className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                <span>{liability}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CaseDnaAnalyzer;
