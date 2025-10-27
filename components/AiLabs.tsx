import React from 'react';
import type { Experiment } from '../types';
import { FlaskIcon } from './icons';

// --- Mock Data --- //
const MOCK_EXPERIMENTS: Experiment[] = [
    {
        id: 1,
        title: "Phishing Evidence Classifier",
        description: "An experimental model that analyzes email headers, body content, and attachments to classify potential phishing attempts and automatically extract key evidence for legal action.",
        status: "Experimental"
    },
    {
        id: 2,
        title: "Smart Contract Risk Scanner",
        description: "Utilizes static and dynamic analysis to scan blockchain smart contracts for common vulnerabilities (e.g., reentrancy attacks) and potential legal ambiguities before deployment.",
        status: "In Development"
    },
    {
        id: 3,
        title: "Predictive E-Discovery Tagger",
        description: "A proof-of-concept tool that uses natural language processing to predict the relevance of documents in large e-discovery datasets, aiming to significantly reduce manual review time.",
        status: "Experimental"
    },
    {
        id: 4,
        title: "Deepfake Detection API",
        description: "A research project focused on creating a service that can analyze video evidence to provide a probability score for deepfake manipulation, crucial for authenticating digital media.",
        status: "Concept"
    },
];


const getStatusColor = (status: Experiment['status']) => {
    switch (status) {
        case 'Experimental': return 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30';
        case 'In Development': return 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30';
        case 'Concept': return 'bg-purple-400/20 text-purple-300 border-purple-400/30';
    }
}

// --- Main Component --- //
const AiLabs: React.FC = () => {
    return (
        <div className="max-w-5xl w-full mx-auto p-4 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
            <div className="text-center mb-8">
                <FlaskIcon className="mx-auto h-12 w-12 text-cyan-400" />
                <h2 className="mt-2 text-3xl font-bold text-slate-100">AI Labs</h2>
                <p className="mt-2 text-md text-slate-400">A glimpse into the future. Here we showcase our experimental projects at the bleeding edge of AI and law.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_EXPERIMENTS.map(exp => (
                    <div key={exp.id} className="p-6 bg-slate-900 rounded-lg border border-slate-700 flex flex-col">
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-cyan-400">{exp.title}</h3>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(exp.status)}`}>
                                    {exp.status}
                                </span>
                            </div>
                            <p className="mt-3 text-sm text-slate-300">
                                {exp.description}
                            </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800 text-right">
                             <button disabled className="text-sm font-semibold text-slate-500 cursor-not-allowed">
                                Coming Soon
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AiLabs;
