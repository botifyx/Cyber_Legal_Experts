
import React from 'react';
import type { Experiment } from '../types';
import { FlaskIcon } from './icons';
import { useLanguage } from './LanguageContext';

const getStatusColor = (status: Experiment['status']) => {
    switch (status) {
        case 'Experimental': return 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30';
        case 'In Development': return 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30';
        case 'Concept': return 'bg-purple-400/20 text-purple-300 border-purple-400/30';
    }
}

const AiLabs: React.FC = () => {
    const { t } = useLanguage();

    const experiments: Experiment[] = [
        {
            id: 1,
            title: t("labs.exp1.title"),
            description: t("labs.exp1.desc"),
            status: "Experimental"
        },
        {
            id: 2,
            title: t("labs.exp2.title"),
            description: t("labs.exp2.desc"),
            status: "In Development"
        },
        {
            id: 3,
            title: t("labs.exp3.title"),
            description: t("labs.exp3.desc"),
            status: "Experimental"
        },
        {
            id: 4,
            title: t("labs.exp4.title"),
            description: t("labs.exp4.desc"),
            status: "Concept"
        },
    ];

    const getLocalizedStatus = (status: Experiment['status']) => {
        switch (status) {
            case 'Experimental': return t("labs.status.experimental");
            case 'In Development': return t("labs.status.development");
            case 'Concept': return t("labs.status.concept");
            default: return status;
        }
    };

    return (
        <div className="max-w-5xl w-full mx-auto p-4 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
            <div className="text-center mb-8">
                <FlaskIcon className="mx-auto h-12 w-12 text-cyan-400" />
                <h2 className="mt-2 text-3xl font-bold text-slate-100">{t("labs.title")}</h2>
                <p className="mt-2 text-md text-slate-400">{t("labs.subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {experiments.map(exp => (
                    <div key={exp.id} className="p-6 bg-slate-900 rounded-lg border border-slate-700 flex flex-col">
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-cyan-400">{exp.title}</h3>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(exp.status)}`}>
                                    {getLocalizedStatus(exp.status)}
                                </span>
                            </div>
                            <p className="mt-3 text-sm text-slate-300">
                                {exp.description}
                            </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800 text-right">
                             <button disabled className="text-sm font-semibold text-slate-500 cursor-not-allowed">
                                {t("labs.coming_soon")}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AiLabs;
