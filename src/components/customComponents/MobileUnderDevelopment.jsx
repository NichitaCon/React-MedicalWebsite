import React from 'react';

const MobileUnderDevelopment = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-8 text-center">
            <div className="max-w-md w-full space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-monitor"
                    >
                        <rect width="20" height="14" x="2" y="3" rx="2" />
                        <line x1="8" x2="16" y1="21" y2="21" />
                        <line x1="12" x2="12" y1="17" y2="21" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">
                    MedApi is currently under development for mobile support
                </h1>
                <p className="text-xl text-muted-foreground">
                    Feel free to test it out on desktop!
                </p>
                <div className="pt-4 border-t border-border">
                    <p className="text-base text-muted-foreground">
                        Or you can go check out some of Nichita's other projects on{' '}
                        <a
                            href="https://nichitaportfolio.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium transition-colors"
                        >
                            nichitaportfolio.vercel.app
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MobileUnderDevelopment;
