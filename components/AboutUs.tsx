import React, { useState } from 'react';
import { TimelineMilestone } from '../types';
import { BotIcon, GavelIcon, LogoIcon, ChevronDownIcon } from './icons';
import { useLanguage } from './LanguageContext';

const AboutUs: React.FC = () => {
    const { t } = useLanguage();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const MOCK_TIMELINE: TimelineMilestone[] = [
        { year: "1986", title: t("about.t.1986.title"), description: t("about.t.1986.desc"), type: "law" },
        { year: "1997", title: t("about.t.1997.title"), description: t("about.t.1997.desc"), type: "ai" },
        { year: "2000", title: t("about.t.2000.title"), description: t("about.t.2000.desc"), type: "law" },
        { year: "2012", title: t("about.t.2012.title"), description: t("about.t.2012.desc"), type: "ai" },
        { year: "2016", title: t("about.t.2016.title"), description: t("about.t.2016.desc"), type: "law" },
        { year: "2017", title: t("about.t.2017.title"), description: t("about.t.2017.desc"), type: "ai" },
        { year: "2018", title: t("about.t.2018.title"), description: t("about.t.2018.desc"), type: "law" },
        { year: "2022", title: t("about.t.2022.title"), description: t("about.t.2022.desc"), type: "ai" },
    ];

    const toggleItem = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };
    
    return (
        <div className="max-w-5xl w-full mx-auto p-4 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
            <div className="text-center mb-12">
                <LogoIcon className="mx-auto h-16 w-16 text-dynamic" />
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
                                        <span className="text-dynamic font-bold block text-sm">{item.year}</span>
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