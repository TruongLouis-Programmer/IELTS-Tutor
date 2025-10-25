
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { getSpeakingEvaluation } from '../services/geminiService';
import { TranscriptEntry, SpeakingFeedback } from '../types';
import Timer from './Timer';
import { LoaderIcon } from './Icons';

// --- Audio Utility Functions ---
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}
// --- End Audio Utility Functions ---


interface SpeakingPracticeScreenProps {
  level: number;
  duration: number;
  topic: string;
  onFinish: (transcript: TranscriptEntry[], report: SpeakingFeedback) => void;
}

type Status = 'CONNECTING' | 'LISTENING' | 'SPEAKING' | 'FINISHED' | 'ERROR';

const SpeakingPracticeScreen: React.FC<SpeakingPracticeScreenProps> = ({ level, duration, topic, onFinish }) => {
    const [status, setStatus] = useState<Status>('CONNECTING');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [isFinishing, setIsFinishing] = useState(false);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    const handleFinish = useCallback(async () => {
        if (isFinishing) return;
        setIsFinishing(true);
        setStatus('FINISHED');
        try {
            const report = await getSpeakingEvaluation(transcript, level);
            onFinish(transcript, report);
        } catch (error) {
            console.error("Failed to get speaking evaluation:", error);
            alert("There was an error generating your report. Please try again.");
            setIsFinishing(false); // Allow retry
        }
    }, [isFinishing, transcript, level, onFinish]);

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const setup = async () => {
            try {
                streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

                // FIX: Updated model to the recommended version for real-time audio.
                sessionPromiseRef.current = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                    callbacks: {
                        onopen: () => {
                            setStatus('LISTENING');
                            const stream = streamRef.current;
                            if (!stream) return;

                            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                            const source = audioContextRef.current.createMediaStreamSource(stream);
                            scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                            
                            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                const l = inputData.length;
                                const int16 = new Int16Array(l);
                                for (let i = 0; i < l; i++) {
                                    int16[i] = inputData[i] * 32768;
                                }
                                const pcmBlob: Blob = {
                                    data: encode(new Uint8Array(int16.buffer)),
                                    mimeType: 'audio/pcm;rate=16000',
                                };
                                sessionPromiseRef.current?.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            };
                            source.connect(scriptProcessorRef.current);
                            scriptProcessorRef.current.connect(audioContextRef.current.destination);
                        },
                        onmessage: async (message: LiveServerMessage) => {
                            // Handle transcript
                            if (message.serverContent?.inputTranscription) {
                                currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                            }
                            if (message.serverContent?.outputTranscription) {
                                currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                            }

                            if (message.serverContent?.turnComplete) {
                                setTranscript(prev => {
                                    const newEntries: TranscriptEntry[] = [];
                                    if(currentInputTranscriptionRef.current.trim()){
                                        newEntries.push({ speaker: 'user', text: currentInputTranscriptionRef.current.trim() });
                                    }
                                    if(currentOutputTranscriptionRef.current.trim()){
                                        newEntries.push({ speaker: 'ai', text: currentOutputTranscriptionRef.current.trim() });
                                    }
                                    currentInputTranscriptionRef.current = '';
                                    currentOutputTranscriptionRef.current = '';
                                    return [...prev, ...newEntries];
                                });
                            }
                            
                            // Handle audio playback
                            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                            if (audioData) {
                                setStatus('SPEAKING');
                                const outputAudioContext = outputAudioContextRef.current;
                                if (!outputAudioContext) return;
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                                const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
                                const source = outputAudioContext.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputAudioContext.destination);
                                source.addEventListener('ended', () => {
                                    sourcesRef.current.delete(source);
                                    if (sourcesRef.current.size === 0) {
                                        setStatus('LISTENING');
                                    }
                                });
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                sourcesRef.current.add(source);
                            }
                        },
                        onerror: (e: ErrorEvent) => {
                            console.error('Session error:', e);
                            setStatus('ERROR');
                        },
                        onclose: () => { },
                    },
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                        systemInstruction: `You are an expert IELTS speaking examiner named Alex, conducting a simulated test. Your persona is calm, professional, and encouraging. Speak clearly at a moderate pace. The candidate is aiming for a band score of ${level}. The total test duration is ${Math.round(duration / 60)} minutes.

**YOUR MOST IMPORTANT RULE: NEVER INTERRUPT THE CANDIDATE.**
Wait for them to finish their sentence completely and pause for at least 2-3 seconds before you start speaking. Patiently waiting is critical for a valid test experience. If they are silent for a long time, you may gently prompt them with "Is there anything else you'd like to add?".

**TIME MANAGEMENT IS CRITICAL:**
Your primary goal is to conduct a realistic test that lasts for the **full ${Math.round(duration / 60)} minutes**. Do not end the test early. You must manage the time to cover all three parts.

**TEST STRUCTURE:**

1.  **PART 1: Introduction & Interview (approx. 40% of total time)**
    *   Begin **immediately** with the introduction. Say: "Good morning/afternoon. My name is Alex. This is a simulated IELTS Speaking test. Can you tell me your full name, please? And what should I call you?".
    *   After they respond, ask 2-3 sets of general questions on familiar topics. Example topics: hometown, work, studies, hobbies, food, weather.
    *   Transition smoothly between topics.

2.  **PART 2: Long Turn (approx. 30% of total time)**
    *   Transition clearly: "Thank you. Now, we'll move on to the second part of the test. I am going to give you a topic and I'd like you to talk about it for one to two minutes."
    *   State the topic clearly. The topic is: **'${topic}'**.
    *   Then say: "Before you start, you have one minute to think about what you are going to say. You can make some notes if you wish. (Pause for 2 seconds). Please start speaking now."
    *   **Listen silently while they speak for 1-2 minutes. DO NOT INTERRUPT.**
    *   When they finish (indicated by a long pause), ask one or two brief, direct follow-up questions related to their answer.

3.  **PART 3: Discussion (Remaining Time)**
    *   Transition again: "Thank you. We've been talking about [topic from part 2], and I'd now like to ask you some more general questions related to this."
    *   Ask more abstract and discussion-based questions related to the Part 2 topic.
    *   **Crucially, you must extend this part to fill the remaining time.** If you run out of initial questions, you are required to generate more related questions on the fly. Broaden the topic. Ask "why" or "what if" questions. Your goal is to keep the conversation going naturally until the timer is almost up.

**CONCLUSION:**
*   **Only when the time is almost up (less than 30 seconds left)**, conclude the test politely. Say: "Alright, that is the end of the speaking test. Thank you very much. Goodbye." Do not say this earlier.

Do not provide any feedback during the test. Start the test now with your introduction.`,
                        inputAudioTranscription: {},
                        outputAudioTranscription: {},
                    },
                });

            } catch (err) {
                console.error('Error setting up audio/session:', err);
                setStatus('ERROR');
            }
        };

        setup();

        return () => {
            sessionPromiseRef.current?.then(session => session.close());
            streamRef.current?.getTracks().forEach(track => track.stop());
            audioContextRef.current?.close();
            outputAudioContextRef.current?.close();
            scriptProcessorRef.current?.disconnect();
        };
    }, [level, topic, duration, onFinish]);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    const statusText = {
        'CONNECTING': 'Connecting to AI examiner...',
        'LISTENING': 'Listening...',
        'SPEAKING': 'AI is speaking...',
        'FINISHED': 'Session finished. Generating report...',
        'ERROR': 'An error occurred. Please refresh.'
    };

    if (isFinishing) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-800 rounded-xl">
                <LoaderIcon className="w-16 h-16 text-cyan-400 animate-spin mb-6" />
                <h2 className="text-2xl font-bold text-white">Generating Your Report</h2>
                <p className="text-slate-400 mt-2">Please wait a moment while we analyze your performance.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[75vh] bg-slate-800 rounded-xl shadow-lg p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${status === 'LISTENING' ? 'bg-green-500 animate-pulse' : status === 'SPEAKING' ? 'bg-cyan-500' : 'bg-yellow-500'}`}></div>
                    <p className="font-semibold text-slate-300">{statusText[status]}</p>
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-cyan-300">Time Remaining</h3>
                    <Timer initialSeconds={duration} onTimeUp={handleFinish} />
                </div>
            </div>
            
            <div className="flex-grow bg-slate-900 rounded-md p-4 overflow-y-auto space-y-4">
                {transcript.map((entry, index) => (
                    <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-lg ${entry.speaker === 'user' ? 'bg-cyan-800 text-white' : 'bg-slate-700 text-slate-200'}`}>
                           <p><strong>{entry.speaker === 'user' ? 'You' : 'Examiner'}:</strong> {entry.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={transcriptEndRef} />
            </div>

            <button
                onClick={handleFinish}
                disabled={isFinishing}
                className="w-full mt-6 px-6 py-4 bg-red-600 hover:bg-red-500 rounded-md text-white font-bold text-lg transition-colors disabled:opacity-50"
            >
                Finish Practice
            </button>
        </div>
    );
};

export default SpeakingPracticeScreen;