import React, { useState, useEffect } from 'react';
import { ListeningTest } from '../types';
import { generateListeningTest, generateListeningTopic } from '../services/geminiService';
import { ListeningIcon, HistoryIcon, LoaderIcon, SparklesIcon } from './Icons';

interface ListeningSetupScreenProps {
  onStart: (test: ListeningTest) => void;
  onHistoryClick: () => void;
  hasHistory: boolean;
}

const difficultyLevels = {
    'Easy': 'Band 5-6',
    'Medium': 'Band 6.5-7.5',
    'Hard': 'Band 8-9'
};

const questionCounts = [5, 7, 10];

const ListeningSetupScreen: React.FC<ListeningSetupScreenProps> = ({ onStart, onHistoryClick, hasHistory }) => {
  const [topic, setTopic] = useState<string>('');
  const [isTopicLoading, setIsTopicLoading] = useState<boolean>(true);
  const [isTestLoading, setIsTestLoading] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(7);

  const handleGenerateTopic = async () => {
    setIsTopicLoading(true);
    try {
      const newTopic = await generateListeningTopic();
      setTopic(newTopic);
    } catch (error) {
      alert("Failed to generate a new topic. Please try again.");
    } finally {
      setIsTopicLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateTopic();
  }, []);

  const handleStartPractice = async () => {
    if (!topic) {
      alert("Please enter a topic.");
      return;
    }
    setIsTestLoading(true);
    try {
      const newTest = await generateListeningTest(topic, difficulty, questionCount);
      onStart(newTest);
    } catch (error) {
      alert("Failed to generate the test based on your topic. Please try again.");
      console.error(error);
      setIsTestLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8 flex flex-col items-center animate-fade-in">
      <ListeningIcon className="w-12 h-12 text-cyan-400 mb-4" />
      <h2 className="text-2xl font-bold text-cyan-300 mb-4 text-center">Prepare for Your Listening Test</h2>
      <p className="text-slate-400 mb-8 text-center max-w-2xl">
        Generate or enter a topic, then customize your test by selecting the difficulty and number of questions.
      </p>

      <div className="w-full max-w-2xl bg-slate-900 rounded-lg p-4 mb-6">
        <label htmlFor="topic-input" className="block text-sm font-medium text-slate-400 mb-2">
          Your Topic (edit below or generate a new one)
        </label>
        {isTopicLoading ? (
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
        disabled={isTopicLoading || isTestLoading}
        className="mb-8 flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-full text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SparklesIcon className="w-5 h-5" />
        {isTopicLoading ? 'Generating...' : 'Generate New Topic'}
      </button>
      
      <div className="w-full max-w-2xl space-y-8 mb-8">
        {/* Difficulty Selector */}
        <div>
            <label className="block text-lg font-medium text-slate-300 mb-3 text-center">Select Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
                {Object.entries(difficultyLevels).map(([level, band]) => (
                    <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`p-3 rounded-md text-center font-medium transition-all duration-200 ${
                        difficulty === level
                        ? 'bg-cyan-500 text-slate-900 scale-105 shadow-lg'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    }`}
                    >
                    {level}
                    <span className="block text-xs font-normal opacity-80">{band}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Question Count Selector */}
        <div>
            <label className="block text-lg font-medium text-slate-300 mb-3 text-center">Number of Questions</label>
            <div className="grid grid-cols-3 gap-3">
                {questionCounts.map(count => (
                    <button
                    key={count}
                    onClick={() => setQuestionCount(count)}
                    className={`p-3 rounded-md text-center font-medium transition-all duration-200 ${
                        questionCount === count
                        ? 'bg-cyan-500 text-slate-900 scale-105 shadow-lg'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    }`}
                    >
                    {count} Questions
                    </button>
                ))}
            </div>
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
          onClick={handleStartPractice}
          disabled={isTopicLoading || isTestLoading || !topic}
          className="w-full flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isTestLoading ? (
              <>
                <LoaderIcon className="w-6 h-6 mr-3 animate-spin" />
                Generating Test...
              </>
            ) : 'Start Test'}
        </button>
      </div>
    </div>
  );
};

export default ListeningSetupScreen;