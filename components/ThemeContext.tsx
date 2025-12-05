
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ColorTheme, detectTheme, THEMES } from '../services/themeService';

type ThemeMode = 'default' | 'alternate';

interface ThemeContextType {
    theme: ColorTheme;
    mode: ThemeMode;
    toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<ColorTheme>(THEMES.default);
    const [mode, setMode] = useState<ThemeMode>('default');

    useEffect(() => {
        const detectedTheme = detectTheme();
        setTheme(detectedTheme);
        applyThemeColors(detectedTheme);
    }, []);

    useEffect(() => {
        applyModeVariables(mode);
    }, [mode]);

    const toggleMode = () => {
        setMode(prev => prev === 'default' ? 'alternate' : 'default');
    };

    const applyThemeColors = (t: ColorTheme) => {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', t.primary);
        root.style.setProperty('--secondary-color', t.secondary);
        root.style.setProperty('--glow-color', t.glow);
        root.style.setProperty('--primary-rgb', t.primaryRGB);
    };

    const applyModeVariables = (m: ThemeMode) => {
        const root = document.documentElement;
        if (m === 'default') {
            // Default Slate Palette
            root.style.setProperty('--slate-50', '248 250 252');
            root.style.setProperty('--slate-100', '241 245 249');
            root.style.setProperty('--slate-200', '226 232 240');
            root.style.setProperty('--slate-300', '203 213 225');
            root.style.setProperty('--slate-400', '148 163 184');
            root.style.setProperty('--slate-500', '100 116 139');
            root.style.setProperty('--slate-600', '71 85 105');
            root.style.setProperty('--slate-700', '51 65 85');
            root.style.setProperty('--slate-800', '30 41 59');
            root.style.setProperty('--slate-900', '15 23 42');
        } else {
            // Alternate "Deep Black" / Zinc Palette
            root.style.setProperty('--slate-50', '250 250 250');
            root.style.setProperty('--slate-100', '244 244 245');
            root.style.setProperty('--slate-200', '228 228 231');
            root.style.setProperty('--slate-300', '212 212 216');
            root.style.setProperty('--slate-400', '161 161 170');
            root.style.setProperty('--slate-500', '113 113 122');
            root.style.setProperty('--slate-600', '82 82 91');
            root.style.setProperty('--slate-700', '63 63 70');
            root.style.setProperty('--slate-800', '39 39 42');
            root.style.setProperty('--slate-900', '9 9 11'); // Zinc 950 essentially
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, mode, toggleMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
