
import React, { useState, useEffect, useRef } from 'react';
import type { ActiveView } from '../App';
import { LogoIcon, GlobeIcon } from './icons';
import { useLanguage } from './LanguageContext';
import { SUPPORTED_LANGUAGES } from '../services/localizationService';

interface HeaderProps {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
}

const NavButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            isActive 
            ? 'bg-slate-700 text-white' 
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
    >
        {label}
    </button>
);

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
    const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const langDropdownRef = useRef<HTMLDivElement>(null);
    const { t, language, setLanguage } = useLanguage();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsToolsMenuOpen(false);
            }
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
                setIsLangMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleToolSelect = (view: ActiveView) => {
        setActiveView(view);
        setIsToolsMenuOpen(false);
    };

    const isToolsActive = ['predictor', 'riskmeter', 'casedna', 'analyzer', 'summarizer', 'copilot'].includes(activeView);

    const currentLangFlag = SUPPORTED_LANGUAGES.find(l => l.code === language)?.flag || '🌐';

    return (
        <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-800">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button onClick={() => setActiveView('home')} className="flex-shrink-0 flex items-center gap-2 text-white">
                            <LogoIcon className="h-8 w-8 text-cyan-400" />
                            <span className="font-bold text-lg hidden sm:inline">Cyber Legal Experts</span>
                        </button>
                    </div>
                    <div className="hidden md:flex items-center space-x-1">
                        <NavButton label={t("nav.home")} isActive={activeView === 'home'} onClick={() => setActiveView('home')} />
                        <NavButton label={t("nav.templates")} isActive={activeView === 'templates'} onClick={() => setActiveView('templates')} />
                        <NavButton label={t("nav.knowledge")} isActive={activeView === 'knowledgehub'} onClick={() => setActiveView('knowledgehub')} />
                        <NavButton label={t("nav.insights")} isActive={activeView === 'insights'} onClick={() => setActiveView('insights')} />
                        <NavButton label={t("nav.labs")} isActive={activeView === 'labs'} onClick={() => setActiveView('labs')} />
                        
                        <div className="relative" ref={dropdownRef}>
                            <NavButton label={t("nav.tools")} isActive={isToolsActive} onClick={() => setIsToolsMenuOpen(prev => !prev)} />
                            {isToolsMenuOpen && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-md shadow-lg animate-slide-down-menu">
                                    <div className="p-1">
                                        <a onClick={() => handleToolSelect('predictor')} className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md cursor-pointer">{t("tool.predictor")}</a>
                                        <a onClick={() => handleToolSelect('riskmeter')} className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md cursor-pointer">{t("tool.riskmeter")}</a>
                                        <a onClick={() => handleToolSelect('casedna')} className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md cursor-pointer">{t("tool.casedna")}</a>
                                        <a onClick={() => handleToolSelect('analyzer')} className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md cursor-pointer">{t("tool.analyzer")}</a>
                                        <a onClick={() => handleToolSelect('summarizer')} className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md cursor-pointer">{t("tool.summarizer")}</a>
                                        <a onClick={() => handleToolSelect('copilot')} className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md cursor-pointer">{t("tool.copilot")}</a>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <NavButton label={t("nav.engage")} isActive={activeView === 'engage'} onClick={() => setActiveView('engage')} />
                        <NavButton label={t("nav.about")} isActive={activeView === 'about'} onClick={() => setActiveView('about')} />

                        {/* Language Selector */}
                        <div className="relative ml-2" ref={langDropdownRef}>
                            <button 
                                onClick={() => setIsLangMenuOpen(prev => !prev)}
                                className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-1"
                            >
                                <span className="text-lg">{currentLangFlag}</span>
                            </button>
                            {isLangMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-md shadow-lg animate-slide-down-menu">
                                    <div className="p-1">
                                        {SUPPORTED_LANGUAGES.map(lang => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    setLanguage(lang.code);
                                                    setIsLangMenuOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-sm rounded-md cursor-pointer flex items-center gap-2 ${language === lang.code ? 'bg-cyan-900/50 text-cyan-400' : 'text-slate-300 hover:bg-slate-700'}`}
                                            >
                                                <span>{lang.flag}</span>
                                                <span>{lang.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
