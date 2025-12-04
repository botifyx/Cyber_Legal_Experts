
import React, { useState } from 'react';
import { TimelineMilestone } from '../types';
import { BotIcon, GavelIcon, LogoIcon, ChevronDownIcon } from './icons';
import { useLanguage } from './LanguageContext';

const MOCK_TIMELINE: TimelineMilestone[] = [
    { year: "1986", title: "Computer Fraud and Abuse Act (CFAA)", description: "The first major US legislation addressing computer crime, setting a foundational legal framework for hacking.", type: "law" },
    { year: "1997", title: "Deep Blue defeats Garry Kasparov", description: "IBM's chess computer's victory marked a major milestone in AI's ability to tackle complex strategic tasks.", type: "ai" },
    { year: "2000", title: "E-SIGN Act", description: "Legitimized electronic signatures in the US, crucial for the growth of digital commerce and contracts.", type: "law" },
    { year: "2012", title: "AlexNet wins ImageNet", description: "A deep learning model that revolutionized computer vision and kickstarted the modern AI boom.", type: "ai" },
    { year: "2016", title: "General Data Protection Regulation (GDPR)", description: "The EU enacted the GDPR, establishing a new global standard for data privacy and user rights.", type: "law" },
    { year: "2017", title: "Transformers Architecture", description: "Google researchers publish 'Attention Is All You Need', introducing the transformer architecture that powers modern LLMs.", type: "ai" },
    { year: "2018", title: "CLOUD Act", description: "US law allowing federal law enforcement to compel tech companies to provide requested data stored on servers regardless of location.", type: "law" },
    { year: "2022", title: "Launch of ChatGPT", description: "OpenAI's release of ChatGPT brought generative AI into the mainstream, demonstrating its powerful capabilities to the public.", type: "ai" },
];

const AboutUs: React.FC = () => {
    const { t } = useLanguage();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };
    
    return (
        <div className="max-w-5xl w-full mx-auto p-4 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
            <div className="text-center mb-12">
                <LogoIcon className="mx-auto h-16 w-16 text-cyan-400" />
                <h2 className="mt-4 text-3xl font-bold text-slate-100">{t("about.title")}</h2>
                <p className="mt-2 text-md text-slate-400 max-w-3xl mx-auto">
                    {t("about.desc")}
                </p>
            </div>

            {/* Accordion Timeline Section */}
            <div>
                <h3 className="text-2xl font-bold text-slate-100 text-center mb-8">{t("about.timeline")}</h3>
                <div className="space-y-4 max-w-3xl mx-auto">
                    {MOCK_TIMELINE.map((item, index) => (
                        <div key={index} className="border border-slate-700 rounded-lg bg-slate-900 overflow-hidden">
                             <button
                                onClick={() => toggleItem(index)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800 transition-colors"
                             >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full border border-slate-700 bg-slate-800 ${item.type === 'law' ? 'text-orange-400' : 'text-purple-400'}`}>
                                         {item.type === 'law' ? <GavelIcon className="w-5 h-5" /> : <BotIcon className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <span className="text-cyan-400 font-bold block text-sm">{item.year}</span>
                                        <span className="text-slate-200 font-semibold">{item.title}</span>
                                    </div>
                                </div>
                                <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${expandedIndex === index ? 'rotate-180' : ''}`} />
                             </button>
                             <div className={`transition-all duration-300 ease-in-out ${expandedIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-4 pt-0 text-slate-400 text-sm border-t border-slate-800/50 mt-2">
                                    {item.description}
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
