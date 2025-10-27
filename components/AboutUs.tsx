import React from 'react';
import { TimelineMilestone } from '../types';
import { BotIcon, GavelIcon, LogoIcon } from './icons';

// --- Mock Data --- //
const MOCK_TIMELINE: TimelineMilestone[] = [
    { year: "1986", title: "Computer Fraud and Abuse Act (CFAA)", description: "The first major US legislation addressing computer crime, setting a foundational legal framework for hacking.", type: "law" },
    { year: "1997", title: "Deep Blue defeats Garry Kasparov", description: "IBM's chess computer's victory marked a major milestone in AI's ability to tackle complex strategic tasks.", type: "ai" },
    { year: "2000", title: "E-SIGN Act", description: "Legitimized electronic signatures in the US, crucial for the growth of digital commerce and contracts.", type: "law" },
    { year: "2012", title: "AlexNet wins ImageNet", description: "A deep learning model that revolutionized computer vision and kickstarted the modern AI boom.", type: "ai" },
    { year: "2016", title: "General Data Protection Regulation (GDPR)", description: "The EU enacted the GDPR, establishing a new global standard for data privacy and user rights.", type: "law" },
    { year: "2017", title: "Transformers Architecture", description: "Google researchers publish 'Attention Is All You Need', introducing the transformer architecture that powers modern LLMs.", type: "ai" },
    { year: "2018", title: "CLOUD Act", description: "US law allowing federal law enforcement to compel tech companies to provide requested data stored on servers regardless of location.", type: "law" },
    { year: "2022", title: "Launch of ChatGPT", description: "OpenAI's release of ChatGPT brought generative AI into the mainstream, demonstrating its powerful capabilities to the public.", type: "ai" },
];

const AboutUs: React.FC = () => {
    return (
        <div className="max-w-5xl w-full mx-auto p-4 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
            <div className="text-center mb-12">
                <LogoIcon className="mx-auto h-16 w-16 text-cyan-400" />
                <h2 className="mt-4 text-3xl font-bold text-slate-100">About Cyber Legal Experts</h2>
                <p className="mt-2 text-md text-slate-400 max-w-3xl mx-auto">
                    We stand at the critical intersection of law and technology. Our firm was founded on the principle that the rapid evolution of the digital world requires an equally innovative approach to legal practice. We are not just lawyers; we are technologists, strategists, and pioneers dedicated to navigating the complexities of cyber law with unparalleled expertise and AI-driven insights.
                </p>
            </div>

            {/* Timeline Section */}
            <div>
                <h3 className="text-2xl font-bold text-slate-100 text-center mb-8">A Parallel History: Cyber Law & AI</h3>
                <div className="relative w-full max-w-3xl mx-auto">
                    {/* Vertical Line */}
                    <div className="absolute left-1/2 top-0 h-full w-0.5 bg-slate-700"></div>

                    {MOCK_TIMELINE.map((item, index) => (
                        <div key={index} className={`relative flex items-center mb-10 ${item.type === 'law' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`w-[calc(50%-2rem)] ${item.type === 'law' ? 'text-right' : 'text-left'}`}>
                                <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg">
                                    <p className="font-bold text-cyan-400 text-lg">{item.year}</p>
                                    <p className="font-semibold text-slate-200 mt-1">{item.title}</p>
                                    <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                                </div>
                            </div>
                            {/* Icon on the timeline */}
                            <div className="absolute left-1/2 -translate-x-1/2 z-10 p-2 bg-slate-800 rounded-full border-2 border-slate-700">
                                {item.type === 'law' 
                                    ? <GavelIcon className="w-6 h-6 text-orange-400" /> 
                                    : <BotIcon className="w-6 h-6 text-purple-400" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
