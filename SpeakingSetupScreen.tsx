import React, { useState, useEffect } from 'react';
// FIX: Corrected import paths for component moved to root directory.
import { TimerIcon, SpeakingIcon, SparklesIcon, HistoryIcon } from './components/Icons';
import { generateSpeakingTopic } from './services/geminiService';

interface SpeakingSetupScreenProps {
  onStart: (level: number, duration: number, topic: string) => void;
  onHistoryClick: () => void;
  hasHistory: boolean;
}

const SpeakingSetupScreen: React.FC<SpeakingSetupScreenProps> = ({ onStart, onHistoryClick, hasHistory }) => {
  const [level, setLevel] = useState<number>(7);
  const [duration, setDuration] = useState<number>(5); // in minutes
  const [topic, setTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    handleGenerateTopic();
  }, []);

  const handleGenerateTopic = async () => {
    setIsLoading(true);
    const newTopic = await generateSpeakingTopic();
    setTopic(newTopic);
    setIsLoading(false);
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8 flex flex-col items-center animate-fade-in">
      <SpeakingIcon className="w-12 h-12 text-cyan-400 mb-4" />
      <h2 className="text-2xl font-bold text-cyan-300 mb-4 text-center">Prepare for Your Speaking Test</h2>
      <p className="text-slate-400 mb-8 text-center max-w-2xl">
        Generate a topic, select your target band score, and choose the practice duration to begin.
      </p>

      <div className="w-full max-w-2xl bg-slate-900 rounded-lg p-4 mb-6">
         <label htmlFor="topic-input" className="block text-sm font-medium text-slate-400 mb-2">
          Your Topic (edit below or generate a new one)
        </label>
        {isLoading ? (
          <div className="text-slate-400 min-h-[70px] flex items-center justify-center">Generating topic...</div>
        ) : (
          <textarea
            id="topic-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-transparent text-lg text-center text-slate-200 resize-none focus:outline-none min-h-[70px]"
            rows={3}
            placeholder="Enter your topic here..."
          />
        )}
      </div>

       <button
        onClick={handleGenerateTopic}
        disabled={isLoading}
        className="mb-8 flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-full text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SparklesIcon className="w-5 h-5" />
        {isLoading ? 'Generating...' : 'Generate New Topic'}
      </button>


      <div className="w-full max-w-md mb-8">
        <label htmlFor="level-slider" className="block text-lg font-medium text-slate-300 mb-4 text-center">
          Target Band Score: <span className="font-bold text-cyan-400 text-2xl ml-2">{level}</span>
        </label>
        <input
          id="level-slider"
          type="range"
          min="1"
          max="9"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <div className="flex justify-between text-xs text-slate-400 px-1 mt-1">
          <span>1</span>
          <span>5</span>
          <span>9</span>
        </div>
      </div>

      <div className="w-full max-w-md mb-10">
        <label className="flex items-center justify-center text-lg font-medium text-slate-300 mb-4">
          <TimerIcon className="w-6 h-6 mr-2 text-cyan-400" />
          Set Practice Duration
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setDuration(5)}
            className={`p-4 rounded-md text-center font-bold transition-all duration-200 ${
              duration === 5
                ? 'bg-cyan-500 text-slate-900 scale-105 shadow-lg'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
          >
            Short Practice<span className="block text-sm font-normal">(5 mins)</span>
          </button>
          <button
            onClick={() => setDuration(15)}
            className={`p-4 rounded-md text-center font-bold transition-all duration-200 ${
              duration === 15
                ? 'bg-cyan-500 text-slate-900 scale-105 shadow-lg'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
          >
            Full Practice<span className="block text-sm font-normal">(15 mins)</span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col sm:flex-row gap-4">
        {hasHistory && (
          <button
            onClick={onHistoryClick}
            className="w-full flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-md text-white font-bold text-lg transition-colors"
          >
            <HistoryIcon className="w-6 h-6" />
            View History
          </button>
        )}
        <button
          onClick={() => onStart(level, duration * 60, topic)}
          disabled={isLoading || !topic}
          className="w-full flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Practice
        </button>
      </div>
    </div>
  );
};

export default SpeakingSetupScreen;
