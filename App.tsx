
import React from 'react';
import { ChartBarIcon, DocumentAddIcon, SparklesIcon, ViewGridIcon, DumbbellIcon } from './components/Icons';
import Dashboard from './components/Dashboard';
import LogWorkoutForm from './components/LogWorkoutForm';
import AILogWorkout from './components/AILogWorkout';
import ExerciseDetailView from './components/ExerciseDetailView';
import ExercisesView from './components/ExercisesView';
import AnalysisDashboard from './components/AnalysisDashboard';
import SettingsView from './components/SettingsView';
import { WorkoutsProvider } from './hooks/useWorkouts';
import { ExercisesProvider } from './hooks/useExercises';
import { NavigationProvider, useAppNavigation, View } from './hooks/useAppNavigation';
import { SettingsProvider, useSettings } from './hooks/useSettings';

const AppContent: React.FC = () => {
  const { currentView, selectedExercise, navigate } = useAppNavigation();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'log':
        return <LogWorkoutForm onWorkoutAdded={() => navigate('dashboard')} />;
      case 'ai-log':
        return <AILogWorkout onWorkoutAdded={() => navigate('dashboard')} />;
      case 'analysis-dashboard':
        return <AnalysisDashboard />;
       case 'analysis-detail':
        return <ExerciseDetailView exerciseName={selectedExercise!} />;
      case 'exercises':
        return <ExercisesView />;
      default:
        return <Dashboard />;
    }
  };

  const NavItem: React.FC<{ view: View; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => (
    <button
      onClick={() => navigate(view)}
      className={`flex-1 flex flex-col items-center justify-center p-2 sm:flex-row sm:justify-start sm:space-x-2 rounded-lg transition-colors duration-200 ${
        currentView === view
          ? 'bg-emerald-500 text-white'
          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
      aria-current={currentView === view}
    >
      {icon}
      <span className="text-xs sm:text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <header className="bg-gray-800/80 backdrop-blur-sm shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-emerald-400 tracking-wider">
            Gym Tracker <span className="text-white">AI</span>
          </h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6">
        {renderView()}
      </main>
      
      <footer className="sticky bottom-0 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 z-10">
        <nav className="container mx-auto px-4 py-2 flex justify-around space-x-2">
          <NavItem view="dashboard" label="Dashboard" icon={<ViewGridIcon />} />
          <NavItem view="exercises" label="Ejercicios" icon={<DumbbellIcon />} />
          <NavItem view="log" label="Log Manual" icon={<DocumentAddIcon />} />
          <NavItem view="ai-log" label="Log con IA" icon={<SparklesIcon />} />
          <NavItem view="analysis-dashboard" label="Análisis" icon={<ChartBarIcon />} />
        </nav>
      </footer>
    </div>
  );
};

const AppContainer: React.FC = () => {
  const { settings } = useSettings();
  const isConfigured = settings.apiKey && settings.sheetId && settings.scriptUrl;

  if (!isConfigured) {
    return <SettingsView />;
  }

  return (
     <WorkoutsProvider>
      <ExercisesProvider>
        <NavigationProvider>
          <AppContent />
        </NavigationProvider>
      </ExercisesProvider>
    </WorkoutsProvider>
  )
}

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContainer />
    </SettingsProvider>
  );
};

export default App;
