import React, { useState } from 'react';
import { LegalTemplate, TemplateCategory } from '../types';
import { FileSignatureIcon, XIcon, BotIcon, ClipboardCopyIcon, CheckIcon } from './icons';
import { useLanguage } from './LanguageContext';

interface TemplateModalProps {
    template: LegalTemplate;
    onClose: () => void;
    onCustomize: (content: string) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ template, onClose, onCustomize }) => {
    const [copied, setCopied] = useState(false);
    const { t } = useLanguage();

    const handleCopy = () => {
        navigator.clipboard.writeText(template.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCustomize = () => {
        const prompt = `Please help me customize the following legal template for my specific needs.\n\n---\n\n${template.content}`;
        onCustomize(prompt);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" 
            style={{ animation: 'modal-fade-in 0.3s ease-out' }}
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-3xl relative flex flex-col h-[90vh]"
                style={{ animation: 'modal-content-scale-up 0.3s ease-out' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-600 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-dynamic">{template.title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{template.content}</pre>
                </div>
                <div className="flex items-center justify-end p-4 border-t border-slate-600 flex-shrink-0 gap-3">
                    <button onClick={handleCopy} className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                        {copied ? <CheckIcon className="w-5 h-5 text-green-400"/> : <ClipboardCopyIcon className="w-5 h-5"/>}
                        {copied ? t("templates.copied") : t("templates.copy")}
                    </button>
                    <button onClick={handleCustomize} className="bg-[color:var(--secondary-color)] hover:bg-[color:var(--primary-color)] text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                        <BotIcon className="w-5 h-5"/>
                        <span>{t("templates.customize")}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

interface TemplatesProps {
    onCustomize: (prompt: string) => void;
}

const Templates: React.FC<TemplatesProps> = ({ onCustomize }) => {
    const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'All'>('All');
    const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate | null>(null);
    const { t } = useLanguage();

    const TEMPLATES: LegalTemplate[] = [
        {
            id: 1,
            title: t("templates.t1.title"),
            description: t("templates.t1.desc"),
            category: "Intellectual Property",
            content: t("templates.t1.content")
        },
        {
            id: 2,
            title: t("templates.t2.title"),
            description: t("templates.t2.desc"),
            category: "Data Privacy",
            content: t("templates.t2.content")
        },
         {
            id: 3,
            title: t("templates.t3.title"),
            description: t("templates.t3.desc"),
            category: "Contracts & Agreements",
            content: t("templates.t3.content")
        },
        {
            id: 4,
            title: t("templates.t4.title"),
            description: t("templates.t4.desc"),
            category: "Data Privacy",
            content: t("templates.t4.content")
        },
        {
            id: 5,
            title: t("templates.t5.title"),
            description: t("templates.t5.desc"),
            category: "Contracts & Agreements",
            content: t("templates.t5.content")
        },
        {
            id: 6,
            title: t("templates.t6.title"),
            description: t("templates.t6.desc"),
            category: "Data Privacy",
            content: t("templates.t6.content")
        },
        {
            id: 7,
            title: t("templates.t7.title"),
            description: t("templates.t7.desc"),
            category: "Contracts & Agreements",
            content: t("templates.t7.content")
        },
        {
            id: 8,
            title: t("templates.t8.title"),
            description: t("templates.t8.desc"),
            category: "Intellectual Property",
            content: t("templates.t8.content")
        }
    ];

    const CATEGORIES: TemplateCategory[] = ["Intellectual Property", "Data Privacy", "Contracts & Agreements"];

    const getLocalizedCategory = (cat: TemplateCategory) => {
        switch(cat) {
            case "Intellectual Property": return t("templates.cat.ip");
            case "Data Privacy": return t("templates.cat.privacy");
            case "Contracts & Agreements": return t("templates.cat.contracts");
            default: return cat;
        }
    }

    const filteredTemplates = selectedCategory === 'All'
        ? TEMPLATES
        : TEMPLATES.filter(t => t.category === selectedCategory);

    return (
        <>
            {selectedTemplate && (
                <TemplateModal
                    template={selectedTemplate}
                    onClose={() => setSelectedTemplate(null)}
                    onCustomize={onCustomize}
                />
            )}
            <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
                <div className="text-center mb-10">
                    <FileSignatureIcon className="mx-auto h-12 w-12 text-dynamic" />
                    <h2 className="mt-2 text-3xl font-bold text-slate-100">{t("templates.title")}</h2>
                    <p className="mt-2 max-w-2xl mx-auto text-slate-400">
                        {t("templates.subtitle")}
                    </p>
                </div>

                <div className="flex justify-center flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setSelectedCategory('All')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedCategory === 'All' ? 'bg-[color:var(--secondary-color)] text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        }`}
                    >
                        {t("templates.category.all")}
                    </button>
                    {CATEGORIES.map(category => (
                         <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                selectedCategory === category ? 'bg-[color:var(--secondary-color)] text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                            }`}
                        >
                            {getLocalizedCategory(category)}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map(template => (
                        <div
                            key={template.id}
                            onClick={() => setSelectedTemplate(template)}
                            className="p-6 bg-slate-900 rounded-lg border border-slate-700 hover:border-[color:var(--primary-color)] cursor-pointer transition-all duration-300 flex flex-col group"
                        >
                            <h3 className="text-lg font-semibold text-slate-100 group-hover:text-dynamic transition-colors">{template.title}</h3>
                            <p className="text-sm text-slate-400 mt-2 flex-grow">{template.description}</p>
                            <span className="mt-4 text-xs font-semibold px-2 py-1 bg-slate-700 text-dynamic rounded-full self-start">
                                {getLocalizedCategory(template.category)}
                            </span>
                        </div>
                    ))}
                </div>

            </div>
        </>
    );
};

export default Templates;