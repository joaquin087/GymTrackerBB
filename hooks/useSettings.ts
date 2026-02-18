
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';

interface Settings {
    apiKey: string;
    sheetId: string;
    scriptUrl: string;
}

interface SettingsContextType {
    settings: Settings;
    saveSettings: (newSettings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getInitialSettings = (): Settings => {
    try {
        const storedSettings = localStorage.getItem('gym-tracker-settings');
        if (storedSettings) {
            return JSON.parse(storedSettings);
        }
    } catch (error) {
        console.error("Failed to load settings from localStorage", error);
    }
    return { apiKey: '', sheetId: '', scriptUrl: '' };
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    const saveSettings = useCallback((newSettings: Settings) => {
        try {
            localStorage.setItem('gym-tracker-settings', JSON.stringify(newSettings));
            setSettings(newSettings);
        } catch (error) {
            console.error("Failed to save settings to localStorage", error);
        }
    }, []);
    
    const value = useMemo(() => ({ settings, saveSettings }), [settings, saveSettings]);

    return React.createElement(SettingsContext.Provider, { value }, children);
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
