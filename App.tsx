import React, { useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
// FIX: Import new types for speaking and listening modules
import { Essay, DetailedFeedback, SpeakingSession, SpeakingFeedback, TranscriptEntry, ListeningSession, ListeningTest, ListeningReport, ReadingSession, ReadingTest, ReadingReport } from './types';
import HomeScreen from './components/HomeScreen';
import SetupScreen from './components/SetupScreen';
import PracticeScreen from './components/PracticeScreen';
import ReportScreen from './components/ReportScreen';
import HistoryScreen from './components/HistoryScreen';
import SpeakingSetupScreen from './components/SpeakingSetupScreen';
import SpeakingPracticeScreen from './components/SpeakingPracticeScreen';
import SpeakingReportScreen from './components/SpeakingReportScreen';
import SpeakingHistoryScreen from './components/SpeakingHistoryScreen';
// FIX: Import new components for listening module
import ListeningSetupScreen from './components/ListeningSetupScreen';
import ListeningPracticeScreen from './components/ListeningPracticeScreen';
import ListeningReportScreen from './components/ListeningReportScreen';
import ListeningHistoryScreen from './components/ListeningHistoryScreen';
// FIX: Import new components for reading module
import ReadingSetupScreen from './components/ReadingSetupScreen';
import ReadingPracticeScreen from './components/ReadingPracticeScreen';
import ReadingReportScreen from './components/ReadingReportScreen';
import ReadingHistoryScreen from './components/ReadingHistoryScreen';
import { LogoIcon } from './components/Icons';

type Screen = 
  | 'home'
  | 'writing-setup'
  | 'writing-practice'
  | 'writing-report'
  | 'writing-history'
  | 'speaking-setup'
  | 'speaking-practice'
  | 'speaking-report'
  | 'speaking-history'
  // FIX: Add screens for listening module
  | 'listening-setup'
  | 'listening-practice'
  | 'listening-report'
  | 'listening-history'
  // FIX: Add screens for reading module
  | 'reading-setup'
  | 'reading-practice'
  | 'reading-report'
  | 'reading-history';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  
  // Writing state
  const [essays, setEssays] = useLocalStorage<Essay[]>('essays', []);
  const [currentTopic, setCurrentTopic] = useState('');
  const [currentTimeLimit, setCurrentTimeLimit] = useState(0);
  const [currentReport, setCurrentReport] = useState<DetailedFeedback | null>(null);

  // Speaking state
  const [speakingSessions, setSpeakingSessions] = useLocalStorage<SpeakingSession[]>('speakingSessions', []);
  const [currentSpeakingTopic, setCurrentSpeakingTopic] = useState('');
  const [currentSpeakingLevel, setCurrentSpeakingLevel] = useState(7);
  const [currentSpeakingDuration, setCurrentSpeakingDuration] = useState(0);
  const [currentSpeakingReport, setCurrentSpeakingReport] = useState<SpeakingFeedback | null>(null);

  // FIX: Add state for listening module
  const [listeningSessions, setListeningSessions] = useLocalStorage<ListeningSession[]>('listeningSessions', []);
  const [currentListeningTest, setCurrentListeningTest] = useState<ListeningTest | null>(null);
  const [currentListeningReport, setCurrentListeningReport] = useState<ListeningReport | null>(null);

  // FIX: Add state for reading module
  const [readingSessions, setReadingSessions] = useLocalStorage<ReadingSession[]>('readingSessions', []);
  const [currentReadingTest, setCurrentReadingTest] = useState<ReadingTest | null>(null);
  const [currentReadingTimeLimit, setCurrentReadingTimeLimit] = useState(0);
  const [currentReadingReport, setCurrentReadingReport] = useState<ReadingReport | null>(null);


  const handleSelectModule = (module: 'writing' | 'speaking' | 'listening' | 'reading') => {
    if (module === 'writing') setScreen('writing-setup');
    if (module === 'speaking') setScreen('speaking-setup');
    if (module === 'listening') setScreen('listening-setup');
    if (module === 'reading') setScreen('reading-setup');
  };

  // Writing flow handlers
  const handleStartWriting = (topic: string, time: number) => {
    setCurrentTopic(topic);
    setCurrentTimeLimit(time);
    setScreen('writing-practice');
  };

  const handleFinishWriting = (essayText: string, report: DetailedFeedback) => {
    const newEssay: Essay = {
      id: Date.now(),
      topic: currentTopic,
      content: essayText,
      feedback: report,
      date: new Date().toISOString(),
    };
    setEssays(prev => [...prev, newEssay]);
    setCurrentReport(report);
    setScreen('writing-report');
  };

  // Speaking flow handlers
  const handleStartSpeaking = (level: number, duration: number, topic: string) => {
    setCurrentSpeakingLevel(level);
    setCurrentSpeakingDuration(duration);
    setCurrentSpeakingTopic(topic);
    setScreen('speaking-practice');
  };

  const handleFinishSpeaking = (transcript: TranscriptEntry[], report: SpeakingFeedback) => {
    const newSession: SpeakingSession = {
      id: Date.now(),
      topic: currentSpeakingTopic,
      transcript: transcript,
      feedback: report,
      date: new Date().toISOString(),
    };
    setSpeakingSessions(prev => [...prev, newSession]);
    setCurrentSpeakingReport(report);
    setScreen('speaking-report');
  };

  // FIX: Add handlers for listening flow
  const handleStartListening = (test: ListeningTest) => {
    setCurrentListeningTest(test);
    setScreen('listening-practice');
  };

  const handleFinishListening = (report: ListeningReport) => {
    if (!currentListeningTest) return;
    const newSession: ListeningSession = {
      id: Date.now(),
      topic: currentListeningTest.topic,
      report: report,
      date: new Date().toISOString(),
    };
    setListeningSessions(prev => [...prev, newSession]);
    setCurrentListeningReport(report);
    setScreen('listening-report');
  };

  // FIX: Add handlers for reading flow
  const handleStartReading = (test: ReadingTest, time: number) => {
    setCurrentReadingTest(test);
    setCurrentReadingTimeLimit(time);
    setScreen('reading-practice');
  };

  const handleFinishReading = (report: ReadingReport) => {
    if (!currentReadingTest) return;
    const newSession: ReadingSession = {
      id: Date.now(),
      topic: currentReadingTest.topic,
      report: report,
      date: new Date().toISOString(),
    };
    setReadingSessions(prev => [...prev, newSession]);
    setCurrentReadingReport(report);
    setScreen('reading-report');
  };
  
  const handleBack = () => {
    if (screen === 'writing-setup' || screen === 'speaking-setup' || screen === 'listening-setup' || screen === 'reading-setup') {
        setScreen('home');
    } else if (screen.startsWith('writing')) {
        setScreen('writing-setup');
    } else if (screen.startsWith('speaking')) {
        setScreen('speaking-setup');
    } else if (screen.startsWith('listening')) {
        setScreen('listening-setup');
    } else if (screen.startsWith('reading')) {
        setScreen('reading-setup');
    } else {
        setScreen('home');
    }
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen onSelectModule={handleSelectModule} />;
      // Writing screens
      case 'writing-setup':
        return <SetupScreen onStart={handleStartWriting} onHistoryClick={() => setScreen('writing-history')} hasHistory={essays.length > 0} />;
      case 'writing-practice':
        return <PracticeScreen topic={currentTopic} timeLimit={currentTimeLimit} onFinish={handleFinishWriting} />;
      case 'writing-report':
        return currentReport && <ReportScreen report={currentReport} onHistory={() => setScreen('writing-history')} onNewSession={() => setScreen('writing-setup')} />;
      case 'writing-history':
        return <HistoryScreen essays={essays} onNewSession={() => setScreen('writing-setup')} />;
      
      // Speaking screens
      case 'speaking-setup':
        return <SpeakingSetupScreen onStart={handleStartSpeaking} onHistoryClick={() => setScreen('speaking-history')} hasHistory={speakingSessions.length > 0} />;
      case 'speaking-practice':
        return <SpeakingPracticeScreen level={currentSpeakingLevel} duration={currentSpeakingDuration} topic={currentSpeakingTopic} onFinish={handleFinishSpeaking} />;
      case 'speaking-report':
        return currentSpeakingReport && <SpeakingReportScreen report={currentSpeakingReport} onHistory={() => setScreen('speaking-history')} onNewSession={() => setScreen('speaking-setup')} />;
      case 'speaking-history':
        return <SpeakingHistoryScreen sessions={speakingSessions} onNewSession={() => setScreen('speaking-setup')} />;
      
      // FIX: Add cases for listening screens
      case 'listening-setup':
        return <ListeningSetupScreen onStart={handleStartListening} onHistoryClick={() => setScreen('listening-history')} hasHistory={listeningSessions.length > 0} />;
      case 'listening-practice':
        return currentListeningTest && <ListeningPracticeScreen test={currentListeningTest} onFinish={handleFinishListening} />;
      case 'listening-report':
        return currentListeningReport && <ListeningReportScreen report={currentListeningReport} onHistory={() => setScreen('listening-history')} onNewSession={() => setScreen('listening-setup')} />;
      case 'listening-history':
        return <ListeningHistoryScreen sessions={listeningSessions} onNewSession={() => setScreen('listening-setup')} />;

      // FIX: Add cases for reading screens
      case 'reading-setup':
        return <ReadingSetupScreen onStart={handleStartReading} onHistoryClick={() => setScreen('reading-history')} hasHistory={readingSessions.length > 0} />;
      case 'reading-practice':
        return currentReadingTest && <ReadingPracticeScreen test={currentReadingTest} timeLimit={currentReadingTimeLimit} onFinish={handleFinishReading} />;
      case 'reading-report':
        return currentReadingReport && <ReadingReportScreen report={currentReadingReport} onHistory={() => setScreen('reading-history')} onNewSession={() => setScreen('reading-setup')} />;
      case 'reading-history':
        return <ReadingHistoryScreen sessions={readingSessions} onNewSession={() => setScreen('reading-setup')} />;

      default:
        return <HomeScreen onSelectModule={handleSelectModule} />;
    }
  };

  const showBackButton = !['home'].includes(screen);

  const backButtonText = () => {
      if (screen.includes('-setup')) return 'Back to Home';
      if (screen.startsWith('writing')) return 'Back to Writing Setup';
      if (screen.startsWith('speaking')) return 'Back to Speaking Setup';
      if (screen.startsWith('listening')) return 'Back to Listening Setup';
      if (screen.startsWith('reading')) return 'Back to Reading Setup';
      return 'Back';
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      <header className="py-4 px-6 sm:px-8 border-b border-slate-700">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
             <div 
                className="flex items-center gap-3 cursor-pointer" 
                onClick={() => setScreen('home')}
                title="Return to Home Screen"
            >
                <LogoIcon className="w-8 h-8 text-cyan-400" />
                <h1 className="text-xl font-bold text-white">IELTS AI Coach</h1>
             </div>
             {showBackButton && (
                <button onClick={handleBack} className="text-sm text-cyan-400 hover:underline">
                    &larr; {backButtonText()}
                </button>
             )}
          </div>
      </header>
      <main className="p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {renderScreen()}
        </div>
      </main>
       <footer className="text-center py-4 text-xs text-slate-500 border-t border-slate-800 mt-8">
        Powered by Google Gemini. This is a practice tool and scores are estimates.
      </footer>
    </div>
  );
}

export default App;