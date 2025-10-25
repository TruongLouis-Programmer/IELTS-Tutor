import React from 'react';
import { DetailedFeedback } from '../types';
import { CheckCircleIcon, XCircleIcon } from './Icons';

interface ReportScreenProps {
  report: DetailedFeedback;
  onHistory: () => void;
  onNewSession: () => void;
}

const ReportCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-slate-800 rounded-lg p-6">
    <h3 className="text-xl font-bold text-cyan-300 mb-3">{title}</h3>
    <div className="text-slate-300 space-y-2">{children}</div>
  </div>
);

const classificationColors: { [key: string]: string } = {
  good: 'text-blue-400',
  refinement: 'text-green-400',
  error: 'text-red-400',
  default: 'text-slate-300'
};

const ReportScreen: React.FC<ReportScreenProps> = ({ report, onHistory, onNewSession }) => {
  const { 
    overallBand, 
    taskAchievement, 
    coherenceAndCohesion, 
    lexicalResource, 
    grammaticalRangeAndAccuracy, 
    strengths, 
    areasForImprovement,
    sentenceFeedback
  } = report;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center bg-slate-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-2">Your IELTS Writing Report</h2>
        <p className="text-slate-400 mb-4">Here's a detailed breakdown of your performance.</p>
        <p className="text-7xl font-bold text-cyan-400">{overallBand.toFixed(1)}</p>
        <p className="text-xl text-slate-300">Overall Band Score</p>
      </div>

      {sentenceFeedback && sentenceFeedback.length > 0 && (
        <ReportCard title="Color-Coded Analysis">
          <p className="text-sm text-slate-400 mb-4">Hover over highlighted sentences to see specific feedback.</p>
          
          <div className="text-xs text-slate-400 mb-4 p-3 bg-slate-900 rounded-md space-y-2">
              <div className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400 flex-shrink-0 mt-1"></span>
                  <div><span className="font-bold text-slate-300">Blue:</span> Exceptionally well-written</div>
              </div>
              <div className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-400 flex-shrink-0 mt-1"></span>
                  <div><span className="font-bold text-slate-300">Green:</span> Good but could be refined for better clarity or word choice</div>
              </div>
              <div className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400 flex-shrink-0 mt-1"></span>
                  <div><span className="font-bold text-slate-300">Red:</span> Clear grammatical or structural errors</div>
              </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-lg whitespace-pre-wrap leading-relaxed">
            {sentenceFeedback.map((item, index) => (
              <React.Fragment key={index}>
                <span 
                  className={`${classificationColors[item.classification] || classificationColors.default} transition-colors duration-200 hover:bg-slate-700 rounded`}
                  title={item.explanation}
                >
                  {item.sentence}
                </span>
                {' '}
              </React.Fragment>
            ))}
          </div>
        </ReportCard>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <ReportCard title="Task Achievement">
          <p>{taskAchievement}</p>
        </ReportCard>
        <ReportCard title="Coherence and Cohesion">
          <p>{coherenceAndCohesion}</p>
        </ReportCard>
        <ReportCard title="Lexical Resource">
          <p>{lexicalResource}</p>
        </ReportCard>
        <ReportCard title="Grammatical Range and Accuracy">
          <p>{grammaticalRangeAndAccuracy}</p>
        </ReportCard>
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
          View All Essays
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

export default ReportScreen;