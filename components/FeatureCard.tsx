
import React from 'react';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    className?: string;
    index?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onClick, className, index = 0 }) => {
    return (
        <div 
            onClick={onClick}
            className={`
                group relative p-6 rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm 
                hover:bg-slate-800/60 hover:border-[color:var(--primary-color)] transition-all duration-300 cursor-pointer 
                flex flex-col items-start text-left overflow-hidden
                hover:shadow-dynamic
                hover:-translate-y-1
                animate-slide-in
                ${className}
            `}
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
        >
            {/* Tech decorative corners */}
            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-6 h-6 text-dynamic opacity-40" viewBox="0 0 24 24" fill="none">
                    <path d="M4 0H0V4" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M20 0H24V4" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
            </div>
            <div className="absolute bottom-0 left-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <svg className="w-6 h-6 text-dynamic opacity-40" viewBox="0 0 24 24" fill="none">
                    <path d="M0 20V24H4" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
            </div>

             {/* Background Gradient Effect - Using RGB variable for opacity */}
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(var(--primary-rgb),0.05)] to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 w-12 h-12 mb-4 rounded-lg bg-slate-900/50 flex items-center justify-center border border-slate-700 group-hover:border-[color:var(--primary-color)] group-hover:text-dynamic text-slate-400 transition-colors duration-300 shadow-inner">
                {icon}
            </div>

            <h3 className="relative z-10 text-lg font-bold text-slate-100 mb-2 group-hover:text-dynamic transition-colors duration-300">
                {title}
            </h3>
            
            <p className="relative z-10 text-slate-400 text-sm leading-relaxed mb-6 group-hover:text-slate-300 transition-colors duration-300">
                {description}
            </p>

            <div className="relative z-10 mt-auto flex items-center text-xs font-bold tracking-wider text-dynamic opacity-60 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                ACCESS TOOL <span className="ml-1 text-lg leading-none">&rsaquo;</span>
            </div>
            
            {/* Animated Bottom Border */}
             <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[color:var(--primary-color)] to-[color:var(--secondary-color)] transition-all duration-500 group-hover:w-full" />
        </div>
    );
};

export default FeatureCard;
