
export type ColorTheme = {
    name: string;
    primary: string; // Main accent (buttons, icons)
    secondary: string; // Secondary accent (gradients)
    glow: string; // Shadow/Glow color
    text: string; // Text highlight color
    border: string; // Border color
    // CSS Variable values (r, g, b) for tailwind opacity support
    primaryRGB: string; 
};

export const THEMES: Record<string, ColorTheme> = {
    // North America: Indigo/Purple (Innovation, Authority)
    north_america: {
        name: 'Indigo Future',
        primary: '#818cf8', // indigo-400
        secondary: '#a78bfa', // purple-400
        glow: 'rgba(99, 102, 241, 0.6)',
        text: 'text-indigo-400',
        border: 'border-indigo-500',
        primaryRGB: '129, 140, 248' 
    },
    // Europe: Emerald/Teal (Growth, Stability, GDPR/Privacy)
    europe: {
        name: 'Emerald Shield',
        primary: '#34d399', // emerald-400
        secondary: '#2dd4bf', // teal-400
        glow: 'rgba(16, 185, 129, 0.6)',
        text: 'text-emerald-400',
        border: 'border-emerald-500',
        primaryRGB: '52, 211, 153'
    },
    // Asia: Red/Amber (Prosperity, Energy, Fortune)
    asia: {
        name: 'Crimson Data',
        primary: '#f87171', // red-400
        secondary: '#fbbf24', // amber-400
        glow: 'rgba(239, 68, 68, 0.6)',
        text: 'text-red-400',
        border: 'border-red-500',
        primaryRGB: '248, 113, 113'
    },
    // South America: Orange/Yellow (Creativity, Dynamism)
    south_america: {
        name: 'Solar Flare',
        primary: '#fb923c', // orange-400
        secondary: '#facc15', // yellow-400
        glow: 'rgba(249, 115, 22, 0.6)',
        text: 'text-orange-400',
        border: 'border-orange-500',
        primaryRGB: '251, 146, 60'
    },
    // Default: Cyan (Tech, Neutral) - Kept as fallback/Oceania
    default: {
        name: 'Cyber Cyan',
        primary: '#22d3ee', // cyan-400
        secondary: '#06b6d4', // cyan-500
        glow: 'rgba(6, 182, 212, 0.6)',
        text: 'text-cyan-400',
        border: 'border-cyan-500',
        primaryRGB: '34, 211, 238'
    }
};

export const detectTheme = (): ColorTheme => {
    try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // North America
        if (timeZone.startsWith('America/New_York') || timeZone.startsWith('America/Los_Angeles') || timeZone.startsWith('America/Chicago') || timeZone.startsWith('America/Toronto')) {
            return THEMES.north_america;
        }

        // Europe
        if (timeZone.startsWith('Europe/') || timeZone.includes('London') || timeZone.includes('Paris') || timeZone.includes('Berlin')) {
            return THEMES.europe;
        }

        // Asia
        if (timeZone.startsWith('Asia/') || timeZone.includes('Tokyo') || timeZone.includes('Shanghai') || timeZone.includes('Kolkata')) {
            return THEMES.asia;
        }

        // South America
        if (timeZone.includes('Sao_Paulo') || timeZone.includes('Buenos_Aires') || timeZone.includes('Bogota')) {
            return THEMES.south_america;
        }

    } catch (e) {
        console.warn("Theme detection failed", e);
    }
    
    return THEMES.default;
};
