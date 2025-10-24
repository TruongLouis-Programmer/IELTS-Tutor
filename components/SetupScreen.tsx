import React, { useState, useEffect } from 'react';
import { TIME_OPTIONS } from '../constants';
import { generateTopic } from '../services/geminiService';
import { SparklesIcon, HistoryIcon, TimerIcon } from './Icons';

interface SetupScreenProps {
  onStart: (topic: string, time: number) => void;
  onHistoryClick: () => void;
  hasHistory: boolean;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, onHistoryClick, hasHistory }) => {
  const [topic, setTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [time, setTime] = useState<number>(40);

  useEffect(() => {
    handleGenerateTopic();
  }, []);

  const handleGenerateTopic = async () => {
    setIsLoading(true);
    const newTopic = await generateTopic();
    setTopic(newTopic);
    setIsLoading(false);
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8 flex flex-col items-center animate-fade-in">
      <h2 className="text-2xl font-bold text-cyan-300 mb-4 text-center">Prepare for Your Writing Test</h2>
      <p className="text-slate-400 mb-8 text-center max-w-2xl">
        Generate a new IELTS Task 2 topic, set your time limit, and start your practice session. Good luck!
      </p>

      <div className="w-full max-w-2xl bg-slate-900 rounded-lg p-4 mb-6">
         <label htmlFor="topic-input" className="block text-sm font-medium text-slate-400 mb-2">
          Your Topic (edit below or generate a new one)
        </label>
        {isLoading ? (
          <div className="text-slate-400 min-h-[100px] flex items-center justify-center">Generating topic...</div>
        ) : (
          <textarea
            id="topic-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-transparent text-lg text-center text-slate-200 resize-none focus:outline-none min-h-[100px]"
            rows={4}
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

      <div className="w-full max-w-2xl mb-8">
        <label className="flex items-center justify-center text-lg font-medium text-slate-300 mb-4">
          <TimerIcon className="w-6 h-6 mr-2 text-cyan-400" />
          Set Time Limit (minutes)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setTime(option)}
              className={`p-3 rounded-md text-center font-medium transition-all duration-200 ${
                time === option
                  ? 'bg-cyan-500 text-slate-900 scale-105 shadow-lg'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4">
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
          onClick={() => onStart(topic, time * 60)}
          disabled={isLoading || !topic}
          className="w-full flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Practice
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;