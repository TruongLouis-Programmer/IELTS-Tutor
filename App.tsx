
import React, { useState, useCallback, useEffect } from 'react';
import { Essay, DetailedFeedback } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import SetupScreen from './components/SetupScreen';
import PracticeScreen from './components/PracticeScreen';
import ReportScreen from './components/ReportScreen';
import HistoryScreen from './components/HistoryScreen';
import { LogoIcon } from './components/Icons';

type View = 'setup' | 'practice' | 'report' | 'history';

const App: React.FC = () => {
  const [view, setView] = useState<View>('setup');
  const [essays, setEssays] = useLocalStorage<Essay[]>('ielts-essays', []);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [timeLimit, setTimeLimit] = useState<number>(40 * 60);
  const [currentEssayText, setCurrentEssayText] = useState<string>('');
  const [latestReport, setLatestReport] = useState<DetailedFeedback | null>(null);

  const startPractice = useCallback((topic: string, time: number) => {
    setCurrentTopic(topic);
    setTimeLimit(time);
    setCurrentEssayText('');
    setView('practice');
  }, []);

  const finishPractice = useCallback((essayText: string, report: DetailedFeedback) => {
    const newEssay: Essay = {
      id: Date.now(),
      topic: currentTopic,
      content: essayText,
      feedback: report,
      date: new Date().toISOString(),
    };
    setEssays(prevEssays => [...prevEssays, newEssay]);
    setLatestReport(report);
    setView('report');
  }, [currentTopic, setEssays]);
  
  const viewHistory = useCallback(() => {
    setView('history');
  }, []);

  const startNewSession = useCallback(() => {
    setView('setup');
  }, []);

  const renderView = () => {
    switch (view) {
      case 'setup':
        return <SetupScreen onStart={startPractice} onHistoryClick={viewHistory} hasHistory={essays.length > 0} />;
      case 'practice':
        return <PracticeScreen topic={currentTopic} timeLimit={timeLimit} onFinish={finishPractice} />;
      case 'report':
        return latestReport ? <ReportScreen report={latestReport} onHistory={viewHistory} onNewSession={startNewSession} /> : <div className="text-center p-8">No report available.</div>;
      case 'history':
        return <HistoryScreen essays={essays} onNewSession={startNewSession} />;
      default:
        return <SetupScreen onStart={startPractice} onHistoryClick={viewHistory} hasHistory={essays.length > 0} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-7xl mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <LogoIcon className="h-8 w-8 text-cyan-400" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">IELTS Writing Tutor AI</h1>
        </div>
        {view !== 'setup' && (
          <button
            onClick={startNewSession}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-medium transition-colors"
          >
            New Session
          </button>
        )}
      </header>
      <main className="w-full max-w-7xl flex-grow">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
