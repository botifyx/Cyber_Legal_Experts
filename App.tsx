
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
import EngagementHub from './components/EngagementHub'; // Import new component
import FeatureCard from './components/FeatureCard';
import { BotIcon, FileTextIcon, NewspaperIcon, CompassIcon, LogoIcon, ShieldCheckIcon, BriefcaseIcon, ChatBubbleIcon, DnaIcon, GaugeIcon, ScaleIcon, BookUserIcon, FlaskIcon } from './components/icons';
import MatrixBackground from './components/MatrixBackground';
import Ticker from './components/Ticker';

export type ActiveView = 'home' | 'analyzer' | 'summarizer' | 'copilot' | 'casedna' | 'riskmeter' | 'predictor' | 'insights' | 'labs' | 'about' | 'engage';

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<ActiveView>('home');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInitialInput, setChatInitialInput] = useState<string | undefined>();
    const [tagline, setTagline] = useState('');

    const taglines = [
        "Your Case, Our Code Guide.",
        "Where Justice Meets Algorithms.",
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
    }, []);

    const handleOpenChat = (initialText?: string) => {
        if (initialText) {
            setChatInitialInput(initialText);
        }
        setIsChatOpen(true);
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
        setChatInitialInput(undefined); // Reset on close
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
            case 'home':
            default:
                return (
                    <>
                        {/* Hero Section */}
                        <div className="relative w-full h-[90vh] min-h-[600px] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
                            <MatrixBackground />
                            <div className="relative z-10 flex flex-col items-center">
                                <h1 className="text-5xl md:text-7xl font-bold text-slate-100 leading-tight">
                                    The Future of Law <br /> Meets <span className="text-cyan-400">Cyber Intelligence</span>
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
                        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold text-slate-100">Our AI-Powered Legal Toolkit</h2>
                                <p className="max-w-2xl mx-auto text-slate-400 mt-2">
                                    Harness a comprehensive suite of intelligent tools designed for the modern legal professional.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <FeatureCard
                                    icon={<ScaleIcon />}
                                    title="Precedent Predictor"
                                    description="Predict case outcomes and discover relevant strategies based on historical legal data."
                                    onClick={() => setActiveView('predictor')}
                                />
                                 <FeatureCard
                                    icon={<GaugeIcon />}
                                    title="AI Cyber Risk Meter"
                                    description="Get a risk score and legal assessment by analyzing policies, contracts, or your online presence."
                                    onClick={() => setActiveView('riskmeter')}
                                />
                                <FeatureCard
                                    icon={<DnaIcon />}
                                    title="Case DNA Analyzer"
                                    description="Visually map timelines, key entities, evidence, and liabilities from case files."
                                    onClick={() => setActiveView('casedna')}
                                />
                                <FeatureCard
                                    icon={<FileTextIcon />}
                                    title="Document Analyzer"
                                    description="Upload legal documents to automatically detect risks and inconsistencies."
                                    onClick={() => setActiveView('analyzer')}
                                />
                                <FeatureCard
                                    icon={<NewspaperIcon />}
                                    title="Legal News Summarizer"
                                    description="Get summaries of the latest court rulings and cyber law news, backed by web sources."
                                    onClick={() => setActiveView('summarizer')}
                                />
                                <FeatureCard
                                    icon={<CompassIcon />}
                                    title="AI Legal Copilot"
                                    description="Receive personalized, step-by-step legal action plans for your specific situation."
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
                &copy; {new Date().getFullYear()} Cyber Legal Experts. For informational purposes only. Not legal advice.
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

export default App;