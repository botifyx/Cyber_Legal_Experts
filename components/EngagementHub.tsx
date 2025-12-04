
import React, { useState } from 'react';
import FeatureCard from './FeatureCard';
import { PodcastIcon, QuizIcon, MailIcon, BotIcon } from './icons';
import VoiceConsultation from './VoiceConsultation';
import CyberLawQuiz from './CyberLawQuiz';
import NewsletterGenerator from './NewsletterGenerator';
import { useLanguage } from './LanguageContext';

type SubView = 'hub' | 'voice' | 'quiz' | 'newsletter';

const EngagementHub: React.FC = () => {
    const [activeSubView, setActiveSubView] = useState<SubView>('hub');
    const { t } = useLanguage();

    const renderSubView = () => {
        switch (activeSubView) {
            case 'voice':
                return <VoiceConsultation onBack={() => setActiveSubView('hub')} />;
            case 'quiz':
                return <CyberLawQuiz onBack={() => setActiveSubView('hub')} />;
            case 'newsletter':
                return <NewsletterGenerator onBack={() => setActiveSubView('hub')} />;
            case 'hub':
            default:
                return (
                    <div className="w-full">
                        <div className="text-center mb-12">
                            <BotIcon className="mx-auto h-12 w-12 text-cyan-400" />
                            <h2 className="mt-2 text-3xl font-bold text-slate-100">{t("engage.title")}</h2>
                            <p className="max-w-2xl mx-auto text-slate-400 mt-2">
                                {t("engage.subtitle")}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FeatureCard
                                index={0}
                                icon={<PodcastIcon className="w-8 h-8" />}
                                title={t("engage.voice.title")}
                                description={t("engage.voice.desc")}
                                onClick={() => setActiveSubView('voice')}
                            />
                            <FeatureCard
                                index={1}
                                icon={<QuizIcon className="w-8 h-8" />}
                                title={t("engage.quiz.title")}
                                description={t("engage.quiz.desc")}
                                onClick={() => setActiveSubView('quiz')}
                            />
                            <FeatureCard
                                index={2}
                                icon={<MailIcon className="w-8 h-8" />}
                                title={t("engage.news.title")}
                                description={t("engage.news.desc")}
                                onClick={() => setActiveSubView('newsletter')}
                            />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
            {renderSubView()}
        </div>
    );
};

export default EngagementHub;
