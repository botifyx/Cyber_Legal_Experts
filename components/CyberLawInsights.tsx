import React, { useState, useRef, useCallback } from 'react';
import type { Article } from '../types';
import { summarizeArticle, generateSpeech } from '../services/geminiService';
import { LoadingIcon, NewspaperIcon, SpeakerOnIcon, BotIcon } from './icons';
import { useLanguage } from './LanguageContext';

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


interface CyberLawInsightsProps {
    onAskAI: (initialText: string) => void;
}

const CyberLawInsights: React.FC<CyberLawInsightsProps> = ({ onAskAI }) => {
    const [summaries, setSummaries] = useState<Record<number, string>>({});
    const [loadingSummary, setLoadingSummary] = useState<number | null>(null);
    const [loadingAudio, setLoadingAudio] = useState<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const { t } = useLanguage();

    const MOCK_ARTICLES: Article[] = [
        {
            id: 1,
            title: t("insights.a1.title"),
            author: "Dr. Evelyn Reed",
            date: "October 26, 2023",
            snippet: t("insights.a1.snippet"),
            content: t("insights.a1.content")
        },
        {
            id: 2,
            title: t("insights.a2.title"),
            author: "Marcus Thorne",
            date: "October 15, 2023",
            snippet: t("insights.a2.snippet"),
            content: t("insights.a2.content")
        },
        {
            id: 3,
            title: t("insights.a3.title"),
            author: "Juliana Chen",
            date: "September 30, 2023",
            snippet: t("insights.a3.snippet"),
            content: t("insights.a3.content")
        },
    ];

    const handleSummarize = useCallback(async (article: Article) => {
        setLoadingSummary(article.id);
        try {
            const summary = await summarizeArticle(article.content);
            setSummaries(prev => ({ ...prev, [article.id]: summary }));
        } catch (error) {
            console.error(error);
            setSummaries(prev => ({ ...prev, [article.id]: "Error generating summary." }));
        } finally {
            setLoadingSummary(null);
        }
    }, []);

    const playAudio = async (text: string) => {
        try {
             if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioData = await generateSpeech(text);
            if (audioData) {
                const audioBuffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                source.start();
                audioSourceRef.current = source;
            }
        } catch(e) {
            console.error("Audio playback failed", e);
        }
    }

    const handlePlayAudio = useCallback(async (articleId: number, text: string) => {
        if (audioSourceRef.current) {
            try {
                audioSourceRef.current.stop();
            } catch(e) { /* ignore */ }
            audioSourceRef.current = null;
        }

        setLoadingAudio(articleId);
        await playAudio(text);
        setLoadingAudio(null);
    }, []);

    const handleAskAI = (article: Article) => {
        const context = `Regarding the article "${article.title}", I have a question: `;
        onAskAI(context);
    };

    return (
        <div className="max-w-5xl w-full mx-auto p-4 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
            <div className="text-center mb-8">
                <NewspaperIcon className="mx-auto h-12 w-12 text-dynamic" />
                <h2 className="mt-2 text-3xl font-bold text-slate-100">{t("insights.title")}</h2>
                <p className="mt-2 text-md text-slate-400">{t("insights.subtitle")}</p>
            </div>

            <div className="space-y-8">
                {MOCK_ARTICLES.map(article => (
                    <article key={article.id} className="p-6 bg-slate-900 rounded-lg border border-slate-700">
                        <h3 className="text-xl font-semibold text-dynamic">{article.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">By {article.author} on {article.date}</p>
                        <p className="mt-3 text-sm text-slate-300">{article.snippet}</p>
                        
                        <div className="mt-4 pt-4 border-t border-slate-800">
                            {summaries[article.id] && (
                                <div className="p-4 bg-slate-800 rounded-md">
                                    <h4 className="font-semibold text-slate-200 mb-2">{t("insights.summary_title")}</h4>
                                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{summaries[article.id]}</p>
                                    <div className="mt-3 flex items-center gap-4">
                                        <button 
                                            onClick={() => handlePlayAudio(article.id, summaries[article.id])}
                                            disabled={loadingAudio === article.id}
                                            className="flex items-center gap-2 text-xs text-dynamic hover:opacity-80 disabled:text-slate-500 disabled:cursor-wait"
                                        >
                                            {loadingAudio === article.id ? <LoadingIcon className="w-4 h-4" /> : <SpeakerOnIcon className="w-4 h-4" />}
                                            <span>{loadingAudio === article.id ? 'Generating...' : t("insights.listen")}</span>
                                        </button>
                                        <button 
                                            onClick={() => handleAskAI(article)}
                                            className="flex items-center gap-2 text-xs text-dynamic hover:opacity-80"
                                        >
                                            <BotIcon className="w-4 h-4" />
                                            <span>{t("insights.ask")}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!summaries[article.id] && (
                             <button 
                                onClick={() => handleSummarize(article)}
                                disabled={loadingSummary === article.id}
                                className="mt-4 text-sm font-semibold text-white bg-[color:var(--secondary-color)] hover:bg-[color:var(--primary-color)] px-4 py-2 rounded-md disabled:bg-slate-600 flex items-center gap-2"
                             >
                                 {loadingSummary === article.id ? <LoadingIcon className="w-5 h-5"/> : null}
                                 <span>{loadingSummary === article.id ? t("insights.generating") : t("insights.generate")}</span>
                             </button>
                        )}
                    </article>
                ))}
            </div>
        </div>
    );
};

export default CyberLawInsights;