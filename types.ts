export interface GrammarError {
  error: string;
  explanation: string;
}

export interface RealtimeFeedback {
  estimatedBand: number;
  grammarErrors: GrammarError[];
  hint: string;
}

export interface SentenceFeedback {
  sentence: string;
  classification: 'good' | 'refinement' | 'error';
  explanation: string;
}

export interface DetailedFeedback {
  overallBand: number;
  taskAchievement: string;
  coherenceAndCohesion: string;
  lexicalResource: string;
  grammaticalRangeAndAccuracy: string;
  strengths: string[];
  areasForImprovement: string[];
  sentenceFeedback: SentenceFeedback[];
}

export interface Essay {
  id: number;
  topic: string;
  content: string;
  feedback: DetailedFeedback;
  date: string;
}

// FIX: Add types for the speaking module.
export interface TranscriptEntry {
  speaker: 'user' | 'ai';
  text: string;
}

export interface SpeakingCriterion {
  score: number;
  feedback: string;
}

export interface SpeakingFeedback {
  overallBand: number;
  fluencyAndCoherence: SpeakingCriterion;
  lexicalResource: SpeakingCriterion;
  grammaticalRangeAndAccuracy: SpeakingCriterion;
  pronunciation: SpeakingCriterion;
  strengths: string[];
  areasForImprovement: string[];
}

export interface SpeakingSession {
  id: number;
  topic: string;
  transcript: TranscriptEntry[];
  feedback: SpeakingFeedback;
  date: string;
}

// FIX: Add types for the Listening module.
export interface ListeningQuestion {
  id: number;
  questionText: string;
  options?: string[];
  type: 'multiple-choice' | 'short-answer';
  answer: string;
}

export interface ListeningTest {
  id: string;
  topic: string;
  audioScript: string;
  questions: ListeningQuestion[];
}

export interface AnswerResult {
  questionId: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface ListeningReport {
  score: number;
  totalQuestions: number;
  results: AnswerResult[];
}

export interface ListeningSession {
  id: number;
  topic: string;
  report: ListeningReport;
  date: string;
}

// FIX: Add types for the Reading module.
export interface ReadingQuestion {
  id: number;
  questionText: string;
  options: string[];
  answer: string;
}

export interface ReadingTest {
  id: string;
  topic: string;
  passage: string;
  questions: ReadingQuestion[];
}

export interface ReadingAnswerResult {
  questionId: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface ReadingReport {
  score: number;
  totalQuestions: number;
  results: ReadingAnswerResult[];
}

export interface ReadingSession {
  id: number;
  topic: string;
  report: ReadingReport;
  date: string;
}
