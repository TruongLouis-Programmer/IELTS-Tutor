export interface GrammarError {
  error: string;
  explanation: string;
}

export interface RealtimeFeedback {
  estimatedBand: number;
  grammarErrors: GrammarError[];
  hint: string;
}

export interface DetailedFeedback {
  overallBand: number;
  taskAchievement: string;
  coherenceAndCohesion: string;
  lexicalResource: string;
  grammaticalRangeAndAccuracy: string;
  strengths: string[];
  areasForImprovement: string[];
}

export interface Essay {
  id: number;
  topic: string;
  content: string;
  feedback: DetailedFeedback;
  date: string;
}