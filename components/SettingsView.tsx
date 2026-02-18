
import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';

const SettingsView: React.FC = () => {
    const { settings, saveSettings } = useSettings();
    const [apiKey, setApiKey] = useState(settings.apiKey || '');
    const [sheetId, setSheetId] = useState(settings.sheetId || '');
    const [scriptUrl, setScriptUrl] = useState(settings.scriptUrl || '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKey || !sheetId || !scriptUrl) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        setError('');
        saveSettings({ apiKey, sheetId, scriptUrl });
        window.location.reload(); // Reload to re-initialize providers with new settings
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-gray-800 rounded-lg shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-emerald-400">Configuración Inicial</h1>
                    <p className="text-gray-400 mt-2">
                        Para usar la app, necesitas conectar tu propia Hoja de Cálculo de Google.
                        Esto asegura que tus datos son tuyos y permanecen privados.
                    </p>
                </div>

                <div className="text-sm p-4 bg-gray-900/50 rounded-md space-y-2">
                    <p>Sigue las instrucciones en el <a href="https://github.com/google/generative-ai-docs/blob/main/PROJECT_README.md" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline hover:text-emerald-300">README del proyecto</a> para obtener estos valores.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                     {error && <p className="text-red-400 text-center">{error}</p>}
                    <div>
                        <label htmlFor="sheetId" className="block text-sm font-medium text-gray-300 mb-1">ID de la Hoja de Cálculo de Google</label>
                        <input
                            id="sheetId"
                            type="text"
                            value={sheetId}
                            onChange={e => setSheetId(e.target.value)}
                            placeholder="Ej: 1qA2b-3cDEFghI4jK5lmnOP6qR7sT8uVWXYZ"
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1">Tu Clave de API de Google Cloud</label>
                        <input
                            id="apiKey"
                            type="password"
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                            placeholder="Pega tu clave de API aquí"
                             className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                     <div>
                        <label htmlFor="scriptUrl" className="block text-sm font-medium text-gray-300 mb-1">URL del Script de Google Apps (Web App)</label>
                        <input
                            id="scriptUrl"
                            type="text"
                            value={scriptUrl}
                            onChange={e => setScriptUrl(e.target.value)}
                            placeholder="Pega la URL de tu script implementado aquí"
                             className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <button type="submit" className="w-full text-white font-bold bg-emerald-600 hover:bg-emerald-500 rounded-md py-3 transition-colors text-lg">
                        Guardar y Empezar a Entrenar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SettingsView;
