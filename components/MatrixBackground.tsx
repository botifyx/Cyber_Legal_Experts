
import React, { useRef, useEffect } from 'react';

const MatrixBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        
        const setup = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*()-+=[]{}|;:,.<>?/\\~`"\'cyberlegalexperts justicia lex data protect';
            const fontSize = 16;
            const columns = Math.floor(canvas.width / fontSize);
            const drops: number[] = [];

            for (let i = 0; i < columns; i++) {
                drops[i] = 1;
            }

            const draw = () => {
                ctx.fillStyle = 'rgba(15, 23, 42, 0.05)'; // slate-900 with low opacity
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = '#06b6d4'; // cyan-500
                ctx.font = `${fontSize}px monospace`;

                for (let i = 0; i < drops.length; i++) {
                    const text = letters[Math.floor(Math.random() * letters.length)];
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
                animationFrameId = requestAnimationFrame(draw);
            };
            draw();
        };

        setup();

        const handleResize = () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            setup();
        }

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};

export default MatrixBackground;
