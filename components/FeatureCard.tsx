
import React from 'react';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-cyan-400 hover:bg-slate-800 transition-all duration-300 cursor-pointer flex flex-col items-center text-center group"
        >
            <div className="text-cyan-400 mb-4 transition-transform duration-300 group-hover:scale-110">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{description}</p>
        </div>
    );
};

export default FeatureCard;
