import React, { useState } from 'react';
import { ReadingSession } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HistoryIcon } from './Icons';

interface ReadingHistoryScreenProps {
  sessions: ReadingSession[];
  onNewSession: () => void;
}

const ReadingHistoryScreen: React.FC<ReadingHistoryScreenProps> = ({ sessions, onNewSession }) => {
  const [selectedSession, setSelectedSession] = useState<ReadingSession | null>(null);

  const chartData = sessions
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(session => ({
      date: new Date(session.date).toLocaleDateString(),
      score: (session.report.score / session.report.totalQuestions) * 100, // Show percentage
    }));

  return (
    <div className="animate-fade-in">
      <div className="bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8 mb-8">
        <h2 className="text-2xl font-bold text-cyan-300 mb-4">Your Reading Progress (% Correct)</h2>
        {sessions.length > 1 ? (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis domain={[0, 100]} stroke="#94a3b8" unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Legend />
                <Line type="monotone" dataKey="score" name="Score (%)" stroke="#22d3ee" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-slate-400 text-center py-10">Complete at least two reading tests to see your progress chart.</p>
        )}
      </div>

      <div className="bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-cyan-300 mb-4 flex items-center">
            <HistoryIcon className="w-7 h-7 mr-3"/>
            Reading History
        </h2>
        <div className="space-y-4">
          {sessions.length > 0 ? (
            sessions.slice().reverse().map(session => (
              <div key={session.id} className="bg-slate-900 p-4 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => setSelectedSession(session)}>
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-200 truncate pr-4">{session.topic}</p>
                    <p className="text-sm text-slate-400">{new Date(session.date).toLocaleString()}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-slate-400">Score</p>
                    <p className="text-2xl font-bold text-cyan-400">{session.report.score}/{session.report.totalQuestions}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-10">You haven't completed any reading tests yet.</p>
          )}
        </div>
      </div>
      
      {selectedSession && (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={() => setSelectedSession(null)}>
            <div className="bg-slate-800 rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-fade-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-cyan-300 mb-2">Test Details</h3>
                <p className="text-sm text-slate-400 mb-4">{new Date(selectedSession.date).toLocaleString()}</p>
                
                <div className="space-y-4 text-slate-300">
                    <div className="bg-slate-900 p-4 rounded-lg">
                        <h4 className="font-semibold text-slate-200 mb-2">Topic:</h4>
                        <p>{selectedSession.topic}</p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg">
                        <h4 className="font-semibold text-slate-200 mb-2">Results (Score: {selectedSession.report.score}/{selectedSession.report.totalQuestions}):</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedSession.report.results.map(r => (
                            <div key={r.questionId}>
                                <p className="font-medium">{r.questionText}</p>
                                <p className={r.isCorrect ? 'text-green-400' : 'text-red-400'}>Your answer: {r.userAnswer || '(none)'}</p>
                                {!r.isCorrect && <p className="text-cyan-300">Correct: {r.correctAnswer}</p>}
                            </div>
                        ))}
                        </div>
                    </div>
                </div>

                <button onClick={() => setSelectedSession(null)} className="mt-6 w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md font-semibold transition-colors">
                Close
                </button>
            </div>
         </div>
      )}

       <div className="mt-8 flex justify-center">
        <button
          onClick={onNewSession}
          className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-bold text-lg transition-colors"
        >
          Start New Practice Test
        </button>
      </div>
    </div>
  );
};

export default ReadingHistoryScreen;