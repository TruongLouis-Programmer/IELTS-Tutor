import React from 'react';
import { ReadingReport } from '../types';
import { CheckCircleIcon, XCircleIcon } from './Icons';

interface ReadingReportScreenProps {
  report: ReadingReport;
  onNewSession: () => void;
  onHistory: () => void;
}

const ReadingReportScreen: React.FC<ReadingReportScreenProps> = ({ report, onNewSession, onHistory }) => {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center bg-slate-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-2">Your Reading Test Report</h2>
        <p className="text-slate-400 mb-4">Here's a breakdown of your performance.</p>
        <p className="text-7xl font-bold text-cyan-400">{report.score} <span className="text-5xl text-slate-400">/ {report.totalQuestions}</span></p>
        <p className="text-xl text-slate-300">Correct Answers</p>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 sm:p-8">
        <h3 className="text-xl font-bold text-cyan-300 mb-4">Detailed Results</h3>
        <div className="space-y-4">
            {report.results.map((result) => (
                <div key={result.questionId} className="bg-slate-900 p-4 rounded-lg border-l-4 border-slate-700">
                    <p className="font-semibold text-slate-300 mb-3">{result.questionText}</p>
                    <div className={`flex items-start gap-3 p-2 rounded-md ${result.isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        {result.isCorrect ? <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" /> : <XCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />}
                        <p className="text-slate-300">Your answer: <span className="font-medium">{result.userAnswer || `(No answer)`}</span></p>
                    </div>
                    {!result.isCorrect && (
                        <div className="flex items-start gap-3 p-2 mt-2 rounded-md bg-slate-700/50">
                            <CheckCircleIcon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                            <p className="text-slate-300">Correct answer: <span className="font-medium text-cyan-300">{result.correctAnswer}</span></p>
                        </div>
                    )}
                </div>
            ))}
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

export default ReadingReportScreen;
