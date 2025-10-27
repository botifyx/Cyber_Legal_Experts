import React, { useState, useRef, useCallback } from 'react';
import type { Article } from '../types';
import { summarizeArticle, generateSpeech } from '../services/geminiService';
import { LoadingIcon, NewspaperIcon, SpeakerOnIcon, BotIcon } from './icons';

// --- Mock Data --- //
const MOCK_ARTICLES: Article[] = [
    {
        id: 1,
        title: "The GDPR Impact on AI Development: A Two-Year Retrospective",
        author: "Dr. Evelyn Reed",
        date: "October 26, 2023",
        snippet: "Examining the complex interplay between the EU's General Data Protection Regulation and the burgeoning field of artificial intelligence, highlighting compliance challenges and emerging best practices.",
        content: "Two years after its full implementation, the GDPR continues to shape the digital landscape. For AI developers, the regulation presents a unique set of hurdles. The principles of data minimization and purpose limitation often conflict with the data-hungry nature of machine learning models. This article explores several key court rulings that have clarified the scope of 'legitimate interest' as a legal basis for processing data for AI training. We also delve into the technical solutions, such as federated learning and differential privacy, that companies are adopting to build GDPR-compliant AI systems. The concept of 'the right to explanation' remains a significant legal and technical challenge, and we analyze the evolving interpretations from various Data Protection Authorities across the EU."
    },
    {
        id: 2,
        title: "Digital Forensics in the Cloud: Navigating Cross-Border Data Laws",
        author: "Marcus Thorne",
        date: "October 15, 2023",
        snippet: "A deep dive into the legal complexities of conducting digital forensic investigations when data is stored across multiple jurisdictions in the cloud.",
        content: "Cloud computing has revolutionized data storage, but it has created a nightmare for digital forensic investigators. When a corporation's data is spread across servers in Ireland, Germany, and the United States, which jurisdiction's laws apply? The U.S. CLOUD Act was a significant attempt to address this, but it often clashes with data sovereignty laws in other nations. This piece examines the mutual legal assistance treaties (MLATs) and their slow, often cumbersome process. We will present a case study of a major corporate espionage investigation that required navigating these conflicting legal frameworks, highlighting the critical importance of chain of custody and data integrity in a virtualized environment. Finally, we propose a framework for pre-incident planning that can help organizations prepare for the inevitability of cross-border digital investigations."
    },
    {
        id: 3,
        title: "Copyright and AI-Generated Art: Who Owns the Masterpiece?",
        author: "Juliana Chen",
        date: "September 30, 2023",
        snippet: "The rise of generative AI models like DALL-E 2 and Midjourney has sparked a fierce debate in copyright law. Who is the author: the user, the AI, or the AI's creator?",
        content: "Recent decisions from the U.S. Copyright Office have consistently denied copyright protection to works generated solely by AI, stating that human authorship is a prerequisite. However, the line is blurring. What level of human input in prompting and curating AI output is sufficient to qualify as authorship? This article analyzes the 'work for hire' doctrine and its potential application to AI systems. We also explore the copyright implications of training AI models on vast datasets of existing, copyrighted images. The concept of 'fair use' is being tested in new and unforeseen ways, and several landmark lawsuits are poised to set important precedents. We will compare the legal approaches being considered in the United States, the UK, and the EU, offering a glimpse into the future of intellectual property in an age of creative machines."
    },
];

// --- Audio Utility Functions --- //
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


// --- Main Component --- //
interface CyberLawInsightsProps {
    onAskAI: (initialText: string) => void;
}

const CyberLawInsights: React.FC<CyberLawInsightsProps> = ({ onAskAI }) => {
    const [summaries, setSummaries] = useState<Record<number, string>>({});
    const [loadingSummary, setLoadingSummary] = useState<number | null>(null);
    const [loadingAudio, setLoadingAudio] = useState<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

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

    const handlePlayAudio = useCallback(async (articleId: number, text: string) => {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current = null;
        }

        setLoadingAudio(articleId);
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
        } catch (error) {
            console.error("Error playing audio:", error);
        } finally {
            setLoadingAudio(null);
        }
    }, []);

    const handleAskAI = (article: Article) => {
        const context = `Regarding the article "${article.title}", I have a question: `;
        onAskAI(context);
    };

    return (
        <div className="max-w-5xl w-full mx-auto p-4 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
            <div className="text-center mb-8">
                <NewspaperIcon className="mx-auto h-12 w-12 text-cyan-400" />
                <h2 className="mt-2 text-3xl font-bold text-slate-100">Cyber Law Insights</h2>
                <p className="mt-2 text-md text-slate-400">Your expert source for analysis on digital law, privacy, and AI governance.</p>
            </div>

            <div className="space-y-8">
                {MOCK_ARTICLES.map(article => (
                    <article key={article.id} className="p-6 bg-slate-900 rounded-lg border border-slate-700">
                        <h3 className="text-xl font-semibold text-cyan-400">{article.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">By {article.author} on {article.date}</p>
                        <p className="mt-3 text-sm text-slate-300">{article.snippet}</p>
                        
                        <div className="mt-4 pt-4 border-t border-slate-800">
                            {summaries[article.id] && (
                                <div className="p-4 bg-slate-800 rounded-md">
                                    <h4 className="font-semibold text-slate-200 mb-2">AI Summary:</h4>
                                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{summaries[article.id]}</p>
                                    <div className="mt-3 flex items-center gap-4">
                                        <button 
                                            onClick={() => handlePlayAudio(article.id, summaries[article.id])}
                                            disabled={loadingAudio === article.id}
                                            className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 disabled:text-slate-500 disabled:cursor-wait"
                                        >
                                            {loadingAudio === article.id ? <LoadingIcon className="w-4 h-4" /> : <SpeakerOnIcon className="w-4 h-4" />}
                                            <span>{loadingAudio === article.id ? 'Generating...' : 'Listen to Summary'}</span>
                                        </button>
                                        <button 
                                            onClick={() => handleAskAI(article)}
                                            className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300"
                                        >
                                            <BotIcon className="w-4 h-4" />
                                            <span>Ask AI about this article</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!summaries[article.id] && (
                             <button 
                                onClick={() => handleSummarize(article)}
                                disabled={loadingSummary === article.id}
                                className="mt-4 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-md disabled:bg-slate-600 flex items-center gap-2"
                             >
                                 {loadingSummary === article.id ? <LoadingIcon className="w-5 h-5"/> : null}
                                 <span>{loadingSummary === article.id ? 'Summarizing...' : 'Generate AI Summary'}</span>
                             </button>
                        )}
                    </article>
                ))}
            </div>
        </div>
    );
};

export default CyberLawInsights;
