import { initialize } from "@pa-client/power-code-sdk/lib/Lifecycle";
import { useEffect, useState, type ReactNode } from "react";

interface PowerProviderProps {
    children: ReactNode;
}

export default function PowerProvider({ children }: PowerProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);
    
    useEffect(() => {
        const initApp = async () => {
            try {
                console.log('🔄 Initializing Power Platform SDK...');
                
                // Check if we're in PowerApps environment
                const isPowerPlatformEnv = window.location.hostname.includes('apps.powerapps.com') || 
                                          window.location.hostname.includes('make.powerapps.com') ||
                                          typeof (window as any).powerPlatformSDK !== 'undefined';
                
                console.log('🔍 Power Platform Environment Check:', {
                    hostname: window.location.hostname,
                    isPowerPlatformEnv,
                    userAgent: navigator.userAgent,
                    powerPlatformSDK: typeof (window as any).powerPlatformSDK
                });

                if (isPowerPlatformEnv) {
                    await initialize();
                    console.log('✅ Power Platform SDK initialized successfully');
                } else {
                    console.log('ℹ️ Running in development environment, skipping Power Platform initialization');
                }
                
                setIsInitialized(true);
            } catch (error) {
                console.error('❌ Failed to initialize Power Platform SDK:', error);
                setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
                // Still allow the app to run in case of initialization failure
                setIsInitialized(true);
            }
        };
        
        initApp();
    }, []);

    // Show loading or error state
    if (!isInitialized) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div>Initializing Power Platform...</div>
                {initError && (
                    <div style={{ color: 'red', fontSize: '14px' }}>
                        Error: {initError}
                    </div>
                )}
            </div>
        );
    }

    return <>{children}</>;
}
