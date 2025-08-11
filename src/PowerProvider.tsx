import { initialize } from "@pa-client/power-code-sdk/lib/Lifecycle";
import { useEffect, type ReactNode, useState, createContext, useContext } from "react";

interface PowerProviderProps {
    children: ReactNode;
}

interface PowerContextValue {
    initialized: boolean;
    initializing: boolean;
    error: Error | null;
    retry: () => void;
}

const PowerContext = createContext<PowerContextValue | undefined>(undefined);

export function usePower() {
    const ctx = useContext(PowerContext);
    if (!ctx) throw new Error('usePower must be used within PowerProvider');
    return ctx;
}

export default function PowerProvider({ children }: PowerProviderProps) {
    const [initialized, setInitialized] = useState(false);
    const [initializing, setInitializing] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const doInit = async () => {
        if (initializing || initialized) return;
        setInitializing(true);
        setError(null);
        try {
            await initialize();
            setInitialized(true);
            console.log('Power Platform SDK initialized successfully');
        } catch (e: any) {
            console.error('Failed to initialize Power Platform SDK:', e);
            setError(e instanceof Error ? e : new Error(String(e)));
        } finally {
            setInitializing(false);
        }
    };

    useEffect(() => {
        // attempt with small retry backoff up to 3 times
        let attempts = 0;
        let cancelled = false;
        const attempt = async () => {
            if (cancelled) return;
            attempts++;
            await doInit();
            if (!initialized && !error && attempts < 3) {
                setTimeout(attempt, 500 * attempts);
            }
        };
        attempt();
        return () => { cancelled = true; };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const value: PowerContextValue = {
        initialized,
        initializing,
        error,
        retry: () => {
            if (!initializing) doInit();
        }
    };

    return (
        <PowerContext.Provider value={value}>
            {!initialized && initializing && (
                <div style={{position:'fixed',top:0,left:0,right:0,padding:'4px 12px',background:'#01426a',color:'#fff',fontSize:12,zIndex:9999}}>
                    Initializing Power Apps SDK...
                </div>
            )}
            {error && !initialized && (
                <div style={{position:'fixed',top:0,left:0,right:0,padding:'4px 12px',background:'#b91c1c',color:'#fff',fontSize:12,zIndex:9999}}>
                    Power Apps SDK init failed. <button style={{marginLeft:8,textDecoration:'underline'}} onClick={() => value.retry()}>Retry</button>
                </div>
            )}
            {children}
        </PowerContext.Provider>
    );
}
