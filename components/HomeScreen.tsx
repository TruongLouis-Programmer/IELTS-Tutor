import React from 'react';
import { WritingIcon, SpeakingIcon, ListeningIcon, ReadingIcon } from './Icons';

interface ModuleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ icon, title, description, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative group bg-slate-800 p-6 rounded-xl text-left w-full h-full flex flex-col items-start transition-all duration-300
        ${disabled
          ? 'cursor-not-allowed opacity-50'
          : 'hover:bg-slate-700 hover:-translate-y-1 hover:shadow-2xl'
        }`}
    >
      {disabled && <div className="absolute top-2 right-2 bg-yellow-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">Coming Soon</div>}
      <div className="bg-slate-900 p-3 rounded-lg mb-4 text-cyan-400">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 flex-grow">{description}</p>
    </button>
  );
};

interface HomeScreenProps {
  onSelectModule: (module: 'writing' | 'speaking' | 'listening' | 'reading') => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectModule }) => {
  return (
    <div className="flex flex-col items-center justify-center animate-fade-in p-4">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-4">IELTS Practice Suite</h2>
      <p className="text-lg text-slate-400 text-center mb-12 max-w-2xl">
        Select a module to begin your targeted practice. Sharpen your skills and boost your confidence for the IELTS exam.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
        <ModuleCard
          icon={<WritingIcon className="w-8 h-8" />}
          title="Writing"
          description="Practice timed writing tasks, get AI-generated topics, and receive detailed feedback on your essays."
          onClick={() => onSelectModule('writing')}
        />
        <ModuleCard
          icon={<SpeakingIcon className="w-8 h-8" />}
          title="Speaking"
          description="Simulate the speaking test with an AI interviewer, record your answers, and get pronunciation feedback."
          onClick={() => onSelectModule('speaking')}
        />
        <ModuleCard
          icon={<ListeningIcon className="w-8 h-8" />}
          title="Listening"
          description="Hone your listening skills with a variety of audio clips and question types from past papers."
          onClick={() => onSelectModule('listening')}
        />
        <ModuleCard
          icon={<ReadingIcon className="w-8 h-8" />}
          title="Reading"
          description="Improve your reading speed and comprehension with diverse texts and exam-style questions."
          onClick={() => onSelectModule('reading')}
        />
      </div>
    </div>
  );
};

export default HomeScreen;
