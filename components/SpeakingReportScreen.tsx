
import React from 'react';
import { SpeakingFeedback } from '../types';
import { CheckCircleIcon, XCircleIcon } from './Icons';

interface SpeakingReportScreenProps {
  report: SpeakingFeedback;
  onNewSession: () => void;
  onHistory: () => void;
}

const ScorePill: React.FC<{score: number}> = ({score}) => {
    const color = score >= 7 ? 'bg-green-500/20 text-green-300' 
                : score >= 5 ? 'bg-yellow-500/20 text-yellow-300' 
                : 'bg-red-500/20 text-red-300';
    return <span className={`px-2 py-1 text-sm font-bold rounded-full ${color}`}>{score.toFixed(1)}</span>
}

const CriteriaCard: React.FC<{ title: string; score: number; feedback: string; }> = ({ title, score, feedback }) => (
  <div className="bg-slate-800 rounded-lg p-6">
    <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-cyan-300">{title}</h3>
        <ScorePill score={score} />
    </div>
    <p className="text-slate-300 space-y-2">{feedback}</p>
  </div>
);

const SpeakingReportScreen: React.FC<SpeakingReportScreenProps> = ({ report, onNewSession, onHistory }) => {
  const { 
    overallBand,
    fluencyAndCoherence,
    lexicalResource,
    grammaticalRangeAndAccuracy,
    pronunciation,
    strengths, 
    areasForImprovement 
  } = report;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center bg-slate-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-2">Your IELTS Speaking Report</h2>
        <p className="text-slate-400 mb-4">Here's a detailed breakdown of your speaking performance.</p>
        <p className="text-7xl font-bold text-cyan-400">{overallBand.toFixed(1)}</p>
        <p className="text-xl text-slate-300">Overall Band Score</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <CriteriaCard title="Fluency and Coherence" score={fluencyAndCoherence.score} feedback={fluencyAndCoherence.feedback} />
        <CriteriaCard title="Lexical Resource" score={lexicalResource.score} feedback={lexicalResource.feedback} />
        <CriteriaCard title="Grammatical Range & Accuracy" score={grammaticalRangeAndAccuracy.score} feedback={grammaticalRangeAndAccuracy.feedback} />
        <CriteriaCard title="Pronunciation" score={pronunciation.score} feedback={pronunciation.feedback} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-400 mb-3 flex items-center"><CheckCircleIcon className="w-6 h-6 mr-2"/>Strengths</h3>
          <ul className="list-disc list-inside text-slate-300 space-y-2">
            {strengths.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center"><XCircleIcon className="w-6 h-6 mr-2"/>Areas for Improvement</h3>
          <ul className="list-disc list-inside text-slate-300 space-y-2">
            {areasForImprovement.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={onHistory}
          className="w-full flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-md text-white font-bold text-lg transition-colors"
        >
          View All Sessions
        </button>
        <button
          onClick={onNewSession}
          className="w-full flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-bold text-lg transition-colors"
        >
          Start New Session
        </button>
      </div>
    </div>
  );
};

export default SpeakingReportScreen;
