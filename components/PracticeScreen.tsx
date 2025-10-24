import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeFeedback, GrammarError } from '../types';
import { getRealtimeFeedback, getDetailedFeedback } from '../services/geminiService';
import Timer from './Timer';
import { LoaderIcon } from './Icons';

interface PracticeScreenProps {
  topic: string;
  timeLimit: number;
  onFinish: (essayText: string, report: any) => void;
}

const PracticeScreen: React.FC<PracticeScreenProps> = ({ topic, timeLimit, onFinish }) => {
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [realtimeFeedback, setRealtimeFeedback] = useState<RealtimeFeedback | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  
  useEffect(() => {
    const words = essay.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  }, [essay]);
  
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const report = await getDetailedFeedback(topic, essay);
      onFinish(essay, report);
    } catch (error) {
      console.error("Failed to submit and get feedback:", error);
      alert("There was an error submitting your essay. Please try again.");
      setIsSubmitting(false);
    }
  }, [essay, topic, onFinish, isSubmitting]);

  const handleTimeUp = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);


  const handleGetRealtimeFeedback = useCallback(async () => {
    if (!essay.trim() || isFeedbackLoading) return;
    setIsFeedbackLoading(true);
    try {
      const feedback = await getRealtimeFeedback(essay);
      setRealtimeFeedback(feedback);
    } catch (error) {
      console.error("Error getting real-time feedback:", error);
    } finally {
      setIsFeedbackLoading(false);
    }
  }, [essay, isFeedbackLoading]);

  // Set up an interval to automatically fetch feedback.
  const savedFeedbackCallback = useRef(handleGetRealtimeFeedback);
  useEffect(() => {
    savedFeedbackCallback.current = handleGetRealtimeFeedback;
  }, [handleGetRealtimeFeedback]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      savedFeedbackCallback.current();
    }, 20000); // Fetch feedback every 20 seconds
    return () => clearInterval(intervalId);
  }, []);

  const handleToggleHint = () => {
    setShowHint(prev => !prev);
  };
  
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const renderHighlightedText = () => {
    if (!realtimeFeedback || realtimeFeedback.grammarErrors.length === 0) {
      return <p>{essay}</p>;
    }
    const errorMap = new Map(realtimeFeedback.grammarErrors.map(e => [e.error, e.explanation]));
    const uniqueErrors = Array.from(new Set(realtimeFeedback.grammarErrors.map(e => e.error)));

    const regex = new RegExp(`(${uniqueErrors.map(escapeRegExp).join('|')})`, 'g');
    const parts = essay.split(regex);

    return parts.map((part, index) => {
      const explanation = errorMap.get(part);
      if (explanation) {
        return (
          <span key={index} className="border-b-2 border-red-500 border-dotted" title={explanation}>
            {part}
          </span>
        );
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
      <div className="flex-grow flex flex-col bg-slate-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-300 mb-2">Your Topic:</h3>
        <p className="text-slate-300 mb-4">{topic}</p>
        
        {isHighlightMode ? (
          <div className="flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-yellow-400">Highlight Mode (Read-only)</p>
                <button onClick={() => setIsHighlightMode(false)} className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded-md">
                    Return to Editor
                </button>
            </div>
            <div className="flex-grow w-full p-4 bg-slate-900 rounded-md text-slate-200 whitespace-pre-wrap break-words min-h-[500px] overflow-y-auto">
              {renderHighlightedText()}
            </div>
          </div>
        ) : (
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Start writing your essay here..."
            className="flex-grow w-full p-4 bg-slate-900 rounded-md text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[500px]"
            disabled={isSubmitting}
          />
        )}

        <div className="text-right mt-2 text-sm text-slate-400 font-medium">{wordCount} words</div>
      </div>

      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">Time Remaining</h3>
          <Timer initialSeconds={timeLimit} onTimeUp={handleTimeUp} />
        </div>
        
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-cyan-300 text-center mb-2">Real-time Feedback</h3>
          <button 
            onClick={handleGetRealtimeFeedback}
            disabled={isFeedbackLoading || !essay.trim()}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isFeedbackLoading ? (
                <>
                <LoaderIcon className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
                </>
            ) : 'Check My Progress'}
          </button>
          {realtimeFeedback && (
            <div className="text-center space-y-3 mt-2 animate-fade-in">
              <p>Est. Band: <span className="font-bold text-xl text-cyan-400">{realtimeFeedback.estimatedBand.toFixed(1)}</span></p>
              <p>Grammar Errors: <span className="font-bold text-xl text-red-400">{realtimeFeedback.grammarErrors.length}</span></p>
               {realtimeFeedback.grammarErrors.length > 0 && (
                 <button 
                    onClick={() => setIsHighlightMode(true)}
                    className="w-full px-4 py-2 bg-red-800 hover:bg-red-700 rounded-md text-sm font-semibold transition-colors"
                 >
                   Highlight Errors
                 </button>
               )}
              <button 
                onClick={handleToggleHint}
                className="text-sm text-cyan-400 hover:underline"
              >
                {showHint ? 'Hide' : 'Show'} Improvement Hint
              </button>
              {showHint && <p className="bg-slate-700 p-3 rounded-md text-sm text-left animate-fade-in">{realtimeFeedback.hint}</p>}
            </div>
          )}
        </div>

        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || !essay.trim()}
          className="w-full mt-auto px-6 py-4 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <LoaderIcon className="w-6 h-6 mr-3 animate-spin" />
              Submitting...
            </>
          ) : 'Finish & Submit'}
        </button>
      </div>
    </div>
  );
};

export default PracticeScreen;