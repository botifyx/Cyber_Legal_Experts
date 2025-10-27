
import React, { useState, useCallback } from 'react';
import { analyzeDocument } from '../services/geminiService';
import { FileTextIcon, UploadIcon, LoadingIcon } from './icons';

const DocumentAnalyzer: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
            setAnalysis('');
            setError('');
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        setIsLoading(true);
        setAnalysis('');
        setError('');

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            if (text) {
                try {
                    const result = await analyzeDocument(text);
                    setAnalysis(result);
                } catch (err) {
                    setError('An error occurred during analysis.');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setError('Could not read file content.');
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            setError('Failed to read file.');
            setIsLoading(false);
        };
        reader.readAsText(file);
    }, [file]);

    return (
        <div className="max-w-4xl mx-auto p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
            <div className="text-center mb-6">
                <FileTextIcon className="mx-auto h-12 w-12 text-cyan-400" />
                <h2 className="mt-2 text-2xl font-semibold text-slate-100">AI Document Analyzer</h2>
                <p className="mt-1 text-sm text-slate-400">Upload a legal document (.txt, .md) for risk and inconsistency analysis.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <label className="relative cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                    <UploadIcon className="w-5 h-5" />
                    <span>{file ? 'Change file' : 'Select a file'}</span>
                    <input type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.md,.html,.rtf" />
                </label>
                {file && <span className="text-slate-300 text-sm truncate max-w-xs">{file.name}</span>}
                <button
                    onClick={handleAnalyze}
                    disabled={!file || isLoading}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? <LoadingIcon className="w-5 h-5"/> : 'Analyze Document'}
                </button>
            </div>
            
            {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}

            {analysis && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">Analysis Results:</h3>
                    <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 max-h-96 overflow-y-auto custom-scrollbar">
                        <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{analysis}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentAnalyzer;
