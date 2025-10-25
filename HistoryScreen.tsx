import React, { useState } from 'react';
// FIX: Corrected import path for type definitions.
import { Essay } from './types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// FIX: Corrected import path for component moved to root directory.
import { HistoryIcon } from './components/Icons';

interface HistoryScreenProps {
  essays: Essay[];
  onNewSession: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ essays, onNewSession }) => {
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);

  const chartData = essays
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(essay => ({
      date: new Date(essay.date).toLocaleDateString(),
      band: essay.feedback.overallBand,
    }));

  return (
    <div className="animate-fade-in">
      <div className="bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8 mb-8">
        <h2 className="text-2xl font-bold text-cyan-300 mb-4">Your Progress</h2>
        {essays.length > 1 ? (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis domain={[1, 9]} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Legend />
                <Line type="monotone" dataKey="band" stroke="#22d3ee" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-slate-400 text-center py-10">Complete at least two essays to see your progress chart.</p>
        )}
      </div>

      <div className="bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-cyan-300 mb-4 flex items-center">
            <HistoryIcon className="w-7 h-7 mr-3"/>
            Essay History
        </h2>
        <div className="space-y-4">
          {essays.length > 0 ? (
            essays.slice().reverse().map(essay => (
              <div key={essay.id} className="bg-slate-900 p-4 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => setSelectedEssay(essay)}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-200 truncate pr-4">{essay.topic}</p>
                    <p className="text-sm text-slate-400">{new Date(essay.date).toLocaleString()}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-slate-400">Band</p>
                    <p className="text-2xl font-bold text-cyan-400">{essay.feedback.overallBand.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-10">You haven't completed any essays yet.</p>
          )}
        </div>
      </div>
      
      {selectedEssay && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={() => setSelectedEssay(null)}>
          <div className="bg-slate-800 rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-cyan-300 mb-2">Essay Details</h3>
            <p className="text-sm text-slate-400 mb-4">{new Date(selectedEssay.date).toLocaleString()}</p>
            
            <div className="space-y-4 text-slate-300">
                <div className="bg-slate-900 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">Topic:</h4>
                    <p>{selectedEssay.topic}</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">Your Essay (Band: {selectedEssay.feedback.overallBand.toFixed(1)}):</h4>
                    <p className="whitespace-pre-wrap max-h-60 overflow-y-auto break-words">{selectedEssay.content}</p>
                </div>
                 <div className="bg-slate-900 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">AI Feedback:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedEssay.feedback.areasForImprovement.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            </div>

            <button onClick={() => setSelectedEssay(null)} className="mt-6 w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md font-semibold transition-colors">
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
          Start New Practice Session
        </button>
      </div>

    </div>
  );
};

export default HistoryScreen;
