
import React, { useState, useEffect, useRef } from 'react';
import type { ActiveView } from '../App';
import { LogoIcon } from './icons';

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
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsToolsMenuOpen(false);
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
                        <NavButton label="Home" isActive={activeView === 'home'} onClick={() => setActiveView('home')} />
                        <NavButton label="Insights" isActive={activeView === 'insights'} onClick={() => setActiveView('insights')} />
                        <NavButton label="AI Labs" isActive={activeView === 'labs'} onClick={() => setActiveView('labs')} />
                        <div className="relative" ref={dropdownRef}>
                            <NavButton label="Tools" isActive={isToolsActive} onClick={() => setIsToolsMenuOpen(prev => !prev)} />
                            {isToolsMenuOpen && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-md shadow-lg animate-slide-down-menu">
                                    <div className="p-1">
                                        <a onClick={() => handleToolSelect('predictor')} className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md cursor-pointer">Precedent Predictor</a>
                                        <a onClick={() => handleToolSelect('riskmeter')} className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md cursor-pointer">AI Cyber Risk Meter</a>
                                        <a onClick={() => handleToolSelect('casedna')} className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md cursor-pointer">Case DNA Analyzer</a>
                                        <a onClick={() => handleToolSelect('analyzer')} className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md cursor-pointer">Document Analyzer</a>
                                        <a onClick={() => handleToolSelect('summarizer')} className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md cursor-pointer">Legal News Summarizer</a>
                                        <a onClick={() => handleToolSelect('copilot')} className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md cursor-pointer">AI Legal Copilot</a>
                                    </div>
                                </div>
                            )}
                        </div>
                        <NavButton label="Engage" isActive={activeView === 'engage'} onClick={() => setActiveView('engage')} />
                        <NavButton label="About Us" isActive={activeView === 'about'} onClick={() => setActiveView('about')} />
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;