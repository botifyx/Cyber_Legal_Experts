
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CylexChatbot from './components/CylexChatbot';
import DocumentAnalyzer from './components/DocumentAnalyzer';
import NewsSummarizer from './components/NewsSummarizer';
import LegalCopilot from './components/LegalCopilot';
import CaseDnaAnalyzer from './components/CaseDnaAnalyzer';
import CyberRiskMeter from './components/CyberRiskMeter';
import PrecedentPredictor from './components/PrecedentPredictor';
import CyberLawInsights from './components/CyberLawInsights';
import AiLabs from './components/AiLabs';
import AboutUs from './components/AboutUs';
import EngagementHub from './components/EngagementHub';
import KnowledgeHub from './components/KnowledgeHub';
import Templates from './components/Templates';
import FeatureCard from './components/FeatureCard';
import { BotIcon, FileTextIcon, NewspaperIcon, CompassIcon, LogoIcon, ShieldCheckIcon, BriefcaseIcon, ChatBubbleIcon, DnaIcon, GaugeIcon, ScaleIcon, BookUserIcon, FlaskIcon, GlobeIcon, FileSignatureIcon } from './components/icons';
import MatrixBackground from './components/MatrixBackground';
import Ticker from './components/Ticker';
import { LanguageProvider, useLanguage } from './components/LanguageContext';

export type ActiveView = 'home' | 'analyzer' | 'summarizer' | 'copilot' | 'casedna' | 'riskmeter' | 'predictor' | 'insights' | 'labs' | 'about' | 'engage' | 'knowledgehub' | 'templates';

const AppContent: React.FC = () => {
    const [activeView, setActiveView] = useState<ActiveView>('home');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInitialInput, setChatInitialInput] = useState<string | undefined>();
    const [tagline, setTagline] = useState('');
    const { t } = useLanguage();

    const taglines = [
        t("hero.subtitle.1"),
        t("hero.subtitle.2"),
        "Defend. Detect. Decide.",
        "Navigating the Digital Legal Frontier.",
        "Cybersecurity Law, Intelligently Deciphered."
    ];

    const threatTickerItems = [
        "Active Phishing Campaign Targeting Financial Institutions Detected.",
        "New Zero-Day Exploit Found in Widely Used Server Software.",
        "Ransomware Attack Disrupts Major Healthcare Provider.",
        "Data Breach Exposes Personal Information of 1M+ Users.",
        "Warning Issued for State-Sponsored Espionage Malware."
    ];

    const caseInsightsTickerItems = [
        "Supreme Court Rules on Digital Privacy in Cloud Computing.",
        "New Precedent Set for IP Theft in a Cross-Border Data Case.",
        "Landmark GDPR Fine Issued for Non-Compliance.",
        "Analysis: Recent Ruling on AI-generated Content Copyright.",
        "Legal Tech Trends: Predictive Analytics in Litigation."
    ];

    useEffect(() => {
        setTagline(taglines[Math.floor(Math.random() * taglines.length)]);
    }, [t]); // Update tagline if language changes

    const handleOpenChat = (initialText?: string) => {
        if (initialText) {
            setChatInitialInput(initialText);
        }
        setIsChatOpen(true);
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
        setChatInitialInput(undefined);
    };


    const renderContent = () => {
        switch (activeView) {
            case 'analyzer':
                return <DocumentAnalyzer />;
            case 'summarizer':
                return <NewsSummarizer />;
            case 'copilot':
                return <LegalCopilot />;
            case 'casedna':
                return <CaseDnaAnalyzer />;
            case 'riskmeter':
                return <CyberRiskMeter />;
            case 'predictor':
                return <PrecedentPredictor />;
            case 'insights':
                return <CyberLawInsights onAskAI={handleOpenChat} />;
            case 'labs':
                return <AiLabs />;
            case 'about':
                return <AboutUs />;
            case 'engage':
                return <EngagementHub />;
            case 'knowledgehub':
                return <KnowledgeHub />;
            case 'templates':
                return <Templates onCustomize={handleOpenChat} />;
            case 'home':
            default:
                return (
                    <>
                        {/* Hero Section */}
                        <div className="relative w-full h-[90vh] min-h-[600px] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
                            <MatrixBackground />
                            <div className="relative z-10 flex flex-col items-center">
                                <h1 className="text-5xl md:text-7xl font-bold text-slate-100 leading-tight">
                                    {t("hero.title").split("Cyber").map((part, i, arr) => (
                                        <React.Fragment key={i}>
                                            {part}
                                            {i < arr.length - 1 && <span className="text-cyan-400">Cyber</span>}
                                        </React.Fragment>
                                    ))}
                                </h1>
                                <p className="text-xl text-slate-300 mt-4 max-w-2xl mx-auto">
                                    {tagline}
                                </p>
                            </div>
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 flex flex-col md:flex-row justify-center items-center gap-4 z-10">
                                <Ticker icon={<ShieldCheckIcon className="w-5 h-5" />} items={threatTickerItems} />
                                <Ticker icon={<BriefcaseIcon className="w-5 h-5" />} items={caseInsightsTickerItems} />
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                            <div className="text-center mb-16 animate-slide-in">
                                <span className="text-cyan-400 font-semibold tracking-wider text-sm uppercase mb-2 block">
                                    {t("section.toolkit")}
                                </span>
                                <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                                    {t("section.toolkit.title")}
                                </h2>
                                <div className="h-1 w-24 bg-cyan-500 mx-auto mt-6 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)]"></div>
                                <p className="max-w-2xl mx-auto text-slate-400 mt-6 text-lg">
                                    {t("section.toolkit.desc")}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <FeatureCard
                                    index={0}
                                    icon={<ScaleIcon />}
                                    title={t("tool.predictor")}
                                    description={t("tool.predictor.desc")}
                                    onClick={() => setActiveView('predictor')}
                                />
                                 <FeatureCard
                                    index={1}
                                    icon={<GaugeIcon />}
                                    title={t("tool.riskmeter")}
                                    description={t("tool.riskmeter.desc")}
                                    onClick={() => setActiveView('riskmeter')}
                                />
                                <FeatureCard
                                    index={2}
                                    icon={<DnaIcon />}
                                    title={t("tool.casedna")}
                                    description={t("tool.casedna.desc")}
                                    onClick={() => setActiveView('casedna')}
                                />
                                 <FeatureCard
                                    index={3}
                                    icon={<FileSignatureIcon className="w-8 h-8" />}
                                    title={t("tool.templates")}
                                    description={t("tool.templates.desc")}
                                    onClick={() => setActiveView('templates')}
                                />
                                <FeatureCard
                                    index={4}
                                    icon={<GlobeIcon className="w-8 h-8" />}
                                    title={t("tool.knowledge")}
                                    description={t("tool.knowledge.desc")}
                                    onClick={() => setActiveView('knowledgehub')}
                                />
                                <FeatureCard
                                    index={5}
                                    icon={<FileTextIcon />}
                                    title={t("tool.analyzer")}
                                    description={t("tool.analyzer.desc")}
                                    onClick={() => setActiveView('analyzer')}
                                />
                                <FeatureCard
                                    index={6}
                                    icon={<NewspaperIcon />}
                                    title={t("tool.summarizer")}
                                    description={t("tool.summarizer.desc")}
                                    onClick={() => setActiveView('summarizer')}
                                />
                                <FeatureCard
                                    index={7}
                                    icon={<CompassIcon />}
                                    title={t("tool.copilot")}
                                    description={t("tool.copilot.desc")}
                                    onClick={() => setActiveView('copilot')}
                                />
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col">
            <Header activeView={activeView} setActiveView={setActiveView} />
            {activeView === 'home' ? (
                <main className="flex-grow flex flex-col">
                    {renderContent()}
                </main>
            ) : (
                <main className="flex-grow p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                    <div className="w-full max-w-7xl">
                        {renderContent()}
                    </div>
                </main>
            )}
             <footer className="text-center p-4 text-slate-500 text-sm bg-slate-900 relative z-10 border-t border-slate-800">
                &copy; {new Date().getFullYear()} {t("footer.disclaimer")}
            </footer>

            {/* Chat Widget */}
            {!isChatOpen ? (
                <button 
                    onClick={() => handleOpenChat()}
                    className="fixed bottom-6 right-6 bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 z-20"
                    aria-label="Open Cylex AI Assistant"
                >
                    <ChatBubbleIcon className="w-6 h-6" />
                </button>
            ) : (
                <CylexChatbot onClose={handleCloseChat} initialInput={chatInitialInput} />
            )}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
}

export default App;
