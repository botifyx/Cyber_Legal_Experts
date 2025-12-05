
import React, { useState, useEffect, useRef } from 'react';

interface TickerProps {
    icon: React.ReactNode;
    items: string[];
    interval?: number;
}

const Ticker: React.FC<TickerProps> = ({ icon, items, interval = 5000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (items.length <= 1) return;

        const clearTimeouts = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };

        const tick = () => {
            setIsFading(true);
            timeoutRef.current = setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
                setIsFading(false);
            }, 300); // Corresponds to transition duration
        };
        
        intervalRef.current = setInterval(tick, interval);

        return clearTimeouts;
    }, [items, interval]);

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-3 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-full px-4 py-2 text-sm max-w-sm w-full">
            <span className="text-dynamic flex-shrink-0">{icon}</span>
            <div className="overflow-hidden h-5 flex-grow relative">
                 <span 
                    className={`absolute inset-0 transition-opacity duration-300 ease-in-out whitespace-nowrap ${isFading ? 'opacity-0' : 'opacity-100'}`}
                >
                    {items[currentIndex]}
                </span>
            </div>
        </div>
    );
};

export default Ticker;
