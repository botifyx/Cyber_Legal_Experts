
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';
import { XIcon } from './icons';

interface TourStep {
    id: string;
    targetId?: string;
    titleKey: string;
    descKey: string;
    position: 'bottom' | 'top' | 'left' | 'right' | 'center';
}

const STEPS: TourStep[] = [
    {
        id: 'welcome',
        titleKey: 'tour.welcome.title',
        descKey: 'tour.welcome.desc',
        position: 'center'
    },
    {
        id: 'tools',
        targetId: 'nav-tools',
        titleKey: 'tour.tools.title',
        descKey: 'tour.tools.desc',
        position: 'bottom'
    },
    {
        id: 'settings',
        targetId: 'nav-settings',
        titleKey: 'tour.settings.title',
        descKey: 'tour.settings.desc',
        position: 'bottom'
    },
    {
        id: 'chat',
        targetId: 'fab-chat',
        titleKey: 'tour.chat.title',
        descKey: 'tour.chat.desc',
        position: 'left' // Usually right bottom, so tool tip to left or top
    }
];

const OnboardingTour: React.FC = () => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
    const { t } = useLanguage();

    useEffect(() => {
        const completed = localStorage.getItem('cylex_tour_completed');
        if (!completed) {
            // Small delay to let app render
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const updatePosition = () => {
        const step = STEPS[currentStepIndex];
        if (step.position === 'center') {
            setCoords(null);
            return;
        }

        if (step.targetId) {
            const el = document.getElementById(step.targetId);
            if (el) {
                const rect = el.getBoundingClientRect();
                setCoords({ top: rect.top, left: rect.left + rect.width / 2 });
            }
        }
    };

    useLayoutEffect(() => {
        if (isVisible) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
            return () => window.removeEventListener('resize', updatePosition);
        }
    }, [isVisible, currentStepIndex]);

    const handleNext = () => {
        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = () => {
        setIsVisible(false);
        localStorage.setItem('cylex_tour_completed', 'true');
    };

    if (!isVisible) return null;

    const currentStep = STEPS[currentStepIndex];
    const isCenter = currentStep.position === 'center';
    const isLastStep = currentStepIndex === STEPS.length - 1;

    // Helper to calculate tooltip style based on position relative to target
    const getTooltipStyle = () => {
        if (!coords || isCenter) return {};

        let style: React.CSSProperties = { position: 'fixed', zIndex: 100 };

        if (currentStep.position === 'bottom') {
            style.top = coords.top + 45; // below element
            style.left = coords.left;
            style.transform = 'translateX(-50%)';
        } else if (currentStep.position === 'top') {
             style.top = coords.top - 200; // above
             style.left = coords.left;
             style.transform = 'translateX(-50%)';
        } else if (currentStep.position === 'left') {
            // e.g. for chat button in bottom right
            // Position to the left and slightly up to clear bottom edge
            style.top = coords.top - 140; 
            style.left = coords.left - 350; 
            style.transform = 'none';
        }

        return style;
    };

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={handleFinish} />

            {/* Modal / Tooltip */}
            <div 
                className={`
                    pointer-events-auto bg-slate-800 border border-[color:var(--primary-color)] 
                    rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.5)] p-6 w-80 text-center
                    transition-all duration-300 ease-out
                    ${isCenter ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
                `}
                style={isCenter ? {} : getTooltipStyle()}
            >
                <div className="absolute -top-3 -right-3">
                    <button onClick={handleFinish} className="bg-slate-700 text-slate-300 rounded-full p-1 hover:bg-red-500 hover:text-white transition-colors">
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>

                <div className="mb-4 flex justify-center">
                    <div className="w-12 h-12 bg-[rgba(var(--primary-rgb),0.2)] rounded-full flex items-center justify-center text-dynamic">
                         {currentStepIndex + 1}
                    </div>
                </div>

                <h3 className="text-xl font-bold text-slate-100 mb-2">{t(currentStep.titleKey)}</h3>
                <p className="text-sm text-slate-400 mb-6">{t(currentStep.descKey)}</p>

                <div className="flex items-center justify-between">
                    <button 
                        onClick={handleFinish}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-300"
                    >
                        {t("tour.btn.skip")}
                    </button>

                    <button 
                        onClick={handleNext}
                        className="bg-[color:var(--secondary-color)] hover:bg-[color:var(--primary-color)] text-white text-sm font-bold py-2 px-6 rounded-full transition-colors shadow-lg"
                    >
                        {isLastStep ? t("tour.btn.finish") : t("tour.btn.next")}
                    </button>
                </div>
                
                {/* Dots indicator */}
                <div className="flex justify-center gap-1.5 mt-4">
                    {STEPS.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`w-2 h-2 rounded-full transition-colors ${idx === currentStepIndex ? 'bg-dynamic' : 'bg-slate-600'}`}
                        />
                    ))}
                </div>
            </div>
            
            {/* Spotlight highlight circle/box */}
            {!isCenter && coords && (
                <div 
                    className={`fixed pointer-events-none border-2 border-[color:var(--primary-color)] shadow-[0_0_20px_var(--glow-color)] transition-all duration-300 ${currentStep.id === 'chat' ? 'rounded-full' : 'rounded-lg'}`}
                    style={{
                        top: coords.top - (currentStep.id === 'chat' ? 8 : 5),
                        left: coords.left - (currentStep.id === 'chat' ? 36 : 60),
                        width: currentStep.id === 'chat' ? 72 : 120,
                        height: currentStep.id === 'chat' ? 72 : 50,
                        opacity: 0.8
                    }}
                />
            )}
        </div>
    );
};

export default OnboardingTour;
