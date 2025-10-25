import React, { useState } from 'react';
import { ReadingTest, ReadingReport, ReadingAnswerResult } from '../types';
import Timer from './Timer';

interface ReadingPracticeScreenProps {
  test: ReadingTest;
  timeLimit: number;
  onFinish: (report: ReadingReport) => void;
}

const ReadingPracticeScreen: React.FC<ReadingPracticeScreenProps> = ({ test, timeLimit, onFinish }) => {
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const handleAnswerChange = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    let score = 0;
    const results: ReadingAnswerResult[] = test.questions.map(q => {
      const userAnswer = userAnswers[q.id] || "";
      const isCorrect = userAnswer.trim() === q.answer.trim();
      if (isCorrect) {
        score++;
      }
      return {
        questionId: q.id,
        questionText: q.questionText,
        userAnswer,
        correctAnswer: q.answer,
        isCorrect
      };
    });

    const report: ReadingReport = {
      score,
      totalQuestions: test.questions.length,
      results
    };
    onFinish(report);
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center bg-slate-800 p-4 rounded-xl shadow-lg mb-6">
          <h2 className="text-xl font-bold text-cyan-300 mb-2">{test.topic}</h2>
          <p className="text-slate-400 mb-2">You have {timeLimit / 60} minutes to complete this section.</p>
          <Timer initialSeconds={timeLimit} onTimeUp={handleSubmit} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Passage Column */}
        <div className="lg:w-1/2 bg-slate-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">Reading Passage</h3>
          <div className="prose prose-invert max-w-none h-[60vh] overflow-y-auto pr-4 text-slate-300">
            {test.passage.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Questions Column */}
        <div className="lg:w-1/2 bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">Questions</h3>
            <div className="space-y-6 h-[60vh] overflow-y-auto pr-4">
                {test.questions.map((q, index) => (
                <div key={q.id}>
                    <p className="font-semibold text-slate-200 mb-3">{index + 1}. {q.questionText}</p>
                    <div className="space-y-2">
                        {q.options.map(option => (
                        <label key={option} className="flex items-center gap-3 p-2 rounded hover:bg-slate-700 cursor-pointer">
                            <input 
                            type="radio" 
                            name={`question-${q.id}`} 
                            value={option}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="form-radio h-4 w-4 text-cyan-600 bg-slate-700 border-slate-600 focus:ring-cyan-500"
                            />
                            <span className="text-slate-300">{option}</span>
                        </label>
                        ))}
                    </div>
                </div>
                ))}
            </div>
        </div>
      </div>
      
      <div className="mt-6">
        <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full mt-2 px-6 py-4 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-bold text-lg transition-colors disabled:opacity-50"
        >
            {isSubmitting ? 'Submitting...' : 'Finish & See Results'}
        </button>
      </div>
    </div>
  );
};

export default ReadingPracticeScreen;