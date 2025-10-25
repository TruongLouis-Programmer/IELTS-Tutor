import React, { useState, useEffect, useRef } from 'react';
import { ListeningTest, ListeningReport, AnswerResult } from '../types';
import { getAudioForScript } from '../services/geminiService';
import { LoaderIcon } from './Icons';

// --- Audio Utility Functions ---
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Function to write a string to a DataView
function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// Function to convert raw PCM data to a WAV file Blob
function pcmToWavBlob(pcmData: Uint8Array): Blob {
    const sampleRate = 24000; // As per Gemini TTS spec
    const numChannels = 1;
    const bitsPerSample = 16;

    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;
    const dataSize = pcmData.length;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true); // true for little-endian
    writeString(view, 8, 'WAVE');

    // "fmt " sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Sub-chunk size for PCM
    view.setUint16(20, 1, true); // Audio format (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // "data" sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    
    // Write PCM data
    const wavBytes = new Uint8Array(buffer);
    wavBytes.set(pcmData, 44);

    return new Blob([wavBytes], { type: 'audio/wav' });
}


interface ListeningPracticeScreenProps {
  test: ListeningTest;
  onFinish: (report: ListeningReport) => void;
}

const ListeningPracticeScreen: React.FC<ListeningPracticeScreenProps> = ({ test, onFinish }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(true);
  const [isAudioPlayed, setIsAudioPlayed] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let url: string | null = null;
    const generateAndLoadAudio = async () => {
      try {
        const base64Audio = await getAudioForScript(test.audioScript);
        const pcmData = decode(base64Audio);
        const audioBlob = pcmToWavBlob(pcmData);
        url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      } catch (error) {
        console.error("Failed to load audio:", error);
        alert("There was an error loading the audio for this test. Please try again.");
      } finally {
        setIsLoadingAudio(false);
      }
    };
    generateAndLoadAudio();

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [test.audioScript]);

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsAudioPlayed(true);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    let score = 0;
    const results: AnswerResult[] = test.questions.map(q => {
      const userAnswer = userAnswers[q.id] || "";
      const isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
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

    const report: ListeningReport = {
      score,
      totalQuestions: test.questions.length,
      results
    };
    onFinish(report);
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-cyan-300 mb-2">Listening Test</h2>
      <p className="text-slate-400 mb-6">{test.topic}</p>

      <div className="bg-slate-900 rounded-lg p-4 mb-8 text-center">
        {isLoadingAudio ? (
          <div className="flex items-center justify-center p-4">
            <LoaderIcon className="w-8 h-8 text-cyan-400 animate-spin mr-3" />
            <span className="text-slate-300">Preparing audio...</span>
          </div>
        ) : (
          <>
            <audio ref={audioRef} src={audioUrl || ''} />
            <button 
              onClick={handlePlayAudio}
              disabled={isAudioPlayed}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAudioPlayed ? 'Audio Played' : 'Play Audio (Once Only)'}
            </button>
            <p className="text-xs text-slate-500 mt-2">Listen carefully. The audio will only play once.</p>
          </>
        )}
      </div>

      <div className="space-y-6">
        {test.questions.map((q, index) => (
          <div key={q.id} className="bg-slate-900 p-4 rounded-lg">
            <p className="font-semibold text-slate-200 mb-3">{index + 1}. {q.questionText}</p>
            {q.type === 'multiple-choice' && q.options ? (
              <div className="space-y-2">
                {q.options.map(option => (
                  <label key={option} className="flex items-center gap-3 p-2 rounded hover:bg-slate-800 cursor-pointer">
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
            ) : (
              <input
                type="text"
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                placeholder="Your answer..."
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full mt-8 px-6 py-4 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-bold text-lg transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Finish & See Results'}
      </button>

    </div>
  );
};

export default ListeningPracticeScreen;