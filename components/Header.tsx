
import React, { useState, useEffect, useRef } from 'react';
import type { ActiveView } from '../App';
import { LogoIcon, MoonIcon, SunIcon } from './icons';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';
import { SUPPORTED_LANGUAGES } from '../services/localizationService';

interface HeaderProps {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
    const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const langDropdownRef = useRef<HTMLDivElement>(null);
    const { t, language, setLanguage } = useLanguage();
    const { mode, toggleMode } = useTheme();

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

    // Helper to generate consistent classes for nav items
    const getNavClass = (isActive: boolean, isDropdownItem = false) => {
        const baseClass = "transition-all duration-200 font-medium rounded-md flex items-center justify-start";
        const layoutClass = isDropdownItem ? "w-full px-3 py-2 text-sm" : "px-3 py-2 text-sm";
        
        // Dynamic styling variables
        // We use style props for colors to leverage the CSS variables cleanly without complex Tailwind string interpolation
        const activeClass = "bg-[rgba(var(--primary-rgb),0.1)] text-dynamic border border-[color:var(--primary-color)] shadow-[0_0_10px_var(--glow-color)]";
        const inactiveClass = "text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent";

        return `${baseClass} ${layoutClass} ${isActive ? activeClass : inactiveClass}`;
    };

    return (
        <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-800 transition-colors duration-500">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button onClick={() => setActiveView('home')} className="flex-shrink-0 flex items-center gap-2 text-white group">
                            <LogoIcon className="h-8 w-8 text-dynamic group-hover:rotate-12 transition-transform duration-300" />
                            <span className="font-bold text-lg hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Cyber Legal Experts</span>
                        </button>
                    </div>
                    <div className="hidden md:flex items-center space-x-1">
                        <button className={getNavClass(activeView === 'home')} onClick={() => setActiveView('home')}>
                            {t("nav.home")}
                        </button>
                        <button className={getNavClass(activeView === 'templates')} onClick={() => setActiveView('templates')}>
                            {t("nav.templates")}
                        </button>
                        <button className={getNavClass(activeView === 'knowledgehub')} onClick={() => setActiveView('knowledgehub')}>
                            {t("nav.knowledge")}
                        </button>
                        <button className={getNavClass(activeView === 'insights')} onClick={() => setActiveView('insights')}>
                            {t("nav.insights")}
                        </button>
                        <button className={getNavClass(activeView === 'labs')} onClick={() => setActiveView('labs')}>
                            {t("nav.labs")}
                        </button>
                        
                        {/* Tools Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                className={getNavClass(isToolsActive)} 
                                onClick={() => setIsToolsMenuOpen(prev => !prev)}
                            >
                                {t("nav.tools")}
                                <svg className={`ml-1 w-4 h-4 transition-transform duration-200 ${isToolsMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {isToolsMenuOpen && (
                                <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl animate-slide-down-menu overflow-hidden z-50 origin-top-left">
                                    <div className="p-1 space-y-0.5">
                                        <button onClick={() => handleToolSelect('predictor')} className={getNavClass(activeView === 'predictor', true)}>{t("tool.predictor")}</button>
                                        <button onClick={() => handleToolSelect('riskmeter')} className={getNavClass(activeView === 'riskmeter', true)}>{t("tool.riskmeter")}</button>
                                        <button onClick={() => handleToolSelect('casedna')} className={getNavClass(activeView === 'casedna', true)}>{t("tool.casedna")}</button>
                                        <button onClick={() => handleToolSelect('analyzer')} className={getNavClass(activeView === 'analyzer', true)}>{t("tool.analyzer")}</button>
                                        <button onClick={() => handleToolSelect('summarizer')} className={getNavClass(activeView === 'summarizer', true)}>{t("tool.summarizer")}</button>
                                        <button onClick={() => handleToolSelect('copilot')} className={getNavClass(activeView === 'copilot', true)}>{t("tool.copilot")}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <button className={getNavClass(activeView === 'engage')} onClick={() => setActiveView('engage')}>
                            {t("nav.engage")}
                        </button>
                        <button className={getNavClass(activeView === 'about')} onClick={() => setActiveView('about')}>
                            {t("nav.about")}
                        </button>

                         {/* Theme Toggle */}
                         <button 
                            onClick={toggleMode}
                            className="p-2 ml-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border border-transparent"
                            title={mode === 'default' ? "Switch to Deep Dark Mode" : "Switch to Default Mode"}
                        >
                            {mode === 'default' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5 text-yellow-400" />}
                        </button>

                        {/* Language Selector */}
                        <div className="relative ml-1" ref={langDropdownRef}>
                            <button 
                                onClick={() => setIsLangMenuOpen(prev => !prev)}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${isLangMenuOpen ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                            >
                                <span className="text-lg">{currentLangFlag}</span>
                            </button>
                            {isLangMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-40 bg-slate-900 border border-slate-700 rounded-lg shadow-xl animate-slide-down-menu overflow-hidden z-50">
                                    <div className="p-1 space-y-0.5">
                                        {SUPPORTED_LANGUAGES.map(lang => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    setLanguage(lang.code);
                                                    setIsLangMenuOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-sm rounded-md cursor-pointer flex items-center gap-3 transition-colors ${language === lang.code ? 'bg-[rgba(var(--primary-rgb),0.1)] text-dynamic border border-[color:var(--primary-color)]' : 'text-slate-300 hover:bg-slate-800 border border-transparent'}`}
                                            >
                                                <span className="text-base">{lang.flag}</span>
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
