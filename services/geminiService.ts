import { GoogleGenAI, Type, Modality } from "@google/genai";
// FIX: Import types for speaking and listening modules
import { RealtimeFeedback, DetailedFeedback, GrammarError, TranscriptEntry, SpeakingFeedback, ListeningTest, ReadingTest } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateTopic(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Generate a random IELTS Task 2 writing topic. Return the topic only, no additional text',
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating topic:", error);
    return "Some people think that schools should stop teaching students to write by hand. Do you agree or disagree?";
  }
}

export async function generateSpeakingTopic(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a random IELTS Speaking Part 2 topic cue card. The topic should be about a personal experience. Return only the topic text, including the main topic and the bullet points to cover. Do not include introductory text like 'Describe a...'.",
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating speaking topic:", error);
    return "A time you received good advice.\nYou should say:\nwhat the advice was\nwho gave you the advice\nwhat the result was\nand explain why you think it was good advice.";
  }
}

// FIX: Add function to generate a listening topic
export async function generateListeningTopic(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a random topic for an IELTS listening test conversation or monologue, suitable for an academic or general context. Return only the topic string (e.g., 'The impact of urban development on local wildlife').",
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating listening topic:", error);
    return "The challenges of renewable energy sources.";
  }
}

// FIX: Add function to generate a reading topic
export async function generateReadingTopic(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a random topic for an IELTS academic reading passage. The topic should be of general academic interest. Return only the topic string (e.g., 'The history of ancient cartography').",
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating reading topic:", error);
    return "The psychological effects of social media.";
  }
}


export async function getRealtimeFeedback(essayText: string): Promise<RealtimeFeedback> {
  try {
     const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: `You are a supportive and encouraging IELTS writing coach. Analyze the following partial essay and provide a quick, real-time assessment. Your tone should be constructive and motivating. The essay may be incomplete. Based on the text so far, provide:
        1. An estimated IELTS band score (a single number, e.g., 6.5). Be fair but not overly harsh, especially for an incomplete essay.
        2. A list of specific grammatical errors. For each error, provide the exact incorrect text fragment ("error") and a brief explanation of the mistake ("explanation"). If there are no errors, return an empty array.
        3. One single, concise and encouraging improvement hint (max 15 words).

        Essay:
        ---
        ${essayText}
        ---

        Return the response ONLY in the specified JSON format.`,
       config: {
         temperature: 0,
         responseMimeType: "application/json",
         responseSchema: {
            type: Type.OBJECT,
            properties: {
              estimatedBand: { type: Type.NUMBER, description: "Estimated IELTS band score." },
              grammarErrors: { 
                type: Type.ARRAY, 
                description: "A list of grammatical errors found.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    error: { type: Type.STRING, description: "The exact text fragment of the error." },
                    explanation: { type: Type.STRING, description: "A brief explanation of the error." }
                  },
                  required: ["error", "explanation"]
                }
              },
              hint: { type: Type.STRING, description: "A short improvement hint." }
            },
            required: ["estimatedBand", "grammarErrors", "hint"]
          },
       },
    });

    const parsed = JSON.parse(response.text.trim());
    return parsed as RealtimeFeedback;

  } catch (error) {
    console.error("Error getting real-time feedback:", error);
    return {
      estimatedBand: 0,
      grammarErrors: [],
      hint: "Could not retrieve hint at this time.",
    };
  }
}

export async function getDetailedFeedback(topic: string, essayText: string): Promise<DetailedFeedback> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `You are a highly-calibrated, official IELTS examiner. Your evaluation must be objective, precise, and strictly aligned with the official IELTS band descriptors. While your feedback should be constructive, accuracy is your top priority. Your goal is to provide a realistic assessment to help the student understand their exact level. Provide a detailed evaluation of the following essay written on the topic: '${topic}'.

      Essay:
      ---
      ${essayText}
      ---

      Your evaluation should be thorough and follow the official IELTS band descriptors. For each point in your evaluation (Task Achievement, Coherence, etc.), you MUST quote specific phrases or sentences from the essay to support your claims. For Areas for Improvement, provide concrete examples of how the student could rephrase their sentences. Provide the following in your response:
      1.  **Overall Band Score**: A single number from 1.0 to 9.0.
      2.  **Task Achievement**: A detailed paragraph evaluating how well the writer addressed all parts of the task.
      3.  **Coherence and Cohesion**: A detailed paragraph evaluating the organization, paragraphing, and use of linking devices.
      4.  **Lexical Resource**: A detailed paragraph evaluating the range and accuracy of vocabulary.
      5.  **Grammatical Range and Accuracy**: A detailed paragraph evaluating the range and accuracy of grammatical structures.
      6.  **Strengths**: A bulleted list of 2-3 key strengths of the essay. Start with what the writer did well.
      7.  **Areas for Improvement**: A bulleted list of 2-3 specific, actionable suggestions for improvement. Frame these as constructive advice rather than criticism.
      8.  **Sentence-by-Sentence Analysis**: Analyze the essay sentence by sentence. For each sentence, provide the full text of the sentence, a classification ('good' for exceptionally well-written sentences (use this sparingly and only for truly impressive sentences), 'refinement' for sentences that are grammatically correct but could be improved in terms of word choice, clarity, or logical flow, or 'error' for sentences with clear grammatical mistakes), and a brief explanation for the classification.

      Return the response ONLY in the specified JSON format.`,
      config: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallBand: { type: Type.NUMBER },
            taskAchievement: { type: Type.STRING },
            coherenceAndCohesion: { type: Type.STRING },
            lexicalResource: { type: Type.STRING },
            grammaticalRangeAndAccuracy: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
            sentenceFeedback: {
              type: Type.ARRAY,
              description: "Sentence-by-sentence analysis of the essay.",
              items: {
                type: Type.OBJECT,
                properties: {
                  sentence: { type: Type.STRING, description: "The full text of the sentence." },
                  classification: { type: Type.STRING, description: "Classification: 'good', 'refinement', or 'error'." },
                  explanation: { type: Type.STRING, description: "Brief explanation for the classification." }
                },
                required: ["sentence", "classification", "explanation"]
              }
            }
          },
          required: ["overallBand", "taskAchievement", "coherenceAndCohesion", "lexicalResource", "grammaticalRangeAndAccuracy", "strengths", "areasForImprovement", "sentenceFeedback"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    return parsed as DetailedFeedback;

  } catch (error) {
    console.error("Error getting detailed feedback:", error);
    throw new Error("Failed to get detailed feedback from AI.");
  }
}

export async function getSpeakingEvaluation(transcript: TranscriptEntry[], targetBand: number): Promise<SpeakingFeedback> {
  const transcriptText = transcript.map(t => `${t.speaker === 'user' ? 'Candidate' : 'Examiner'}: ${t.text}`).join('\n');
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `You are a highly-calibrated, official IELTS examiner evaluating a speaking test. The candidate is aiming for a band score of ${targetBand}. Your evaluation must be objective, precise, and strictly aligned with the official IELTS band descriptors for Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation.

      Transcript:
      ---
      ${transcriptText}
      ---

      Your evaluation should be thorough. For each of the four criteria:
      1.  Provide a band score (a single number from 1.0 to 9.0).
      2.  Provide a detailed feedback paragraph explaining the score, quoting specific examples from the transcript to support your claims.

      Additionally, provide:
      3.  **Overall Band Score**: A single number from 1.0 to 9.0, which is the average of the four criteria scores.
      4.  **Strengths**: A bulleted list of 2-3 key strengths.
      5.  **Areas for Improvement**: A bulleted list of 2-3 specific, actionable suggestions for improvement.

      Return the response ONLY in the specified JSON format.`,
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallBand: { type: Type.NUMBER },
            fluencyAndCoherence: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                feedback: { type: Type.STRING }
              },
              required: ["score", "feedback"]
            },
            lexicalResource: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                feedback: { type: Type.STRING }
              },
              required: ["score", "feedback"]
            },
            grammaticalRangeAndAccuracy: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                feedback: { type: Type.STRING }
              },
              required: ["score", "feedback"]
            },
            pronunciation: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                feedback: { type: Type.STRING }
              },
              required: ["score", "feedback"]
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["overallBand", "fluencyAndCoherence", "lexicalResource", "grammaticalRangeAndAccuracy", "pronunciation", "strengths", "areasForImprovement"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    return parsed as SpeakingFeedback;

  } catch (error) {
    console.error("Error getting speaking evaluation:", error);
    throw new Error("Failed to get speaking evaluation from AI.");
  }
}

// FIX: Update function to generate a listening test based on a user-provided topic.
export async function generateListeningTest(topic: string, difficulty: string, questionCount: number): Promise<ListeningTest> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `You are an expert IELTS test creator. Generate a complete IELTS Listening practice test section about the topic: **"${topic}"**.
      The test must be based on this topic. Adhere to the following criteria:
      - **Difficulty Level**: ${difficulty}. This should influence the vocabulary, speaker pace, and complexity of the questions. (e.g., Easy corresponds to Band 5-6, Medium to 6.5-7.5, Hard to 8-9).
      - **Number of Questions**: Exactly ${questionCount}.

      Your response MUST be a JSON object containing the following keys:
      1.  "id": A unique string identifier.
      2.  "topic": A brief, one-sentence description of the audio content, based on the provided topic.
      3.  "audioScript": The full transcript of the audio recording. This should be a single block of text, well-formatted, with clear speaker differentiation if it's a conversation (e.g., "Tutor: ...", "Student: ..."). The script must contain all the information needed to answer the questions. The script length should be appropriate for the number of questions.
      4.  "questions": An array of exactly ${questionCount} question objects. Each object must have:
          a. "id": A number (1, 2, 3, ...).
          b. "questionText": The full text of the question.
          c. "type": The question type, either "short-answer" or "multiple-choice".
          d. "options" (for "multiple-choice" only): An array of 3-4 string options.
          e. "answer": The correct answer as a string. The answer must be explicitly found within the "audioScript".

      Ensure the questions directly correspond to the information presented in the audio script.
      Return ONLY the specified JSON object.`,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            topic: { type: Type.STRING },
            audioScript: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  questionText: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["multiple-choice", "short-answer"] },
                  options: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
                  answer: { type: Type.STRING }
                },
                required: ["id", "questionText", "type", "answer"]
              }
            }
          },
          required: ["id", "topic", "audioScript", "questions"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    // Ensure question IDs are sequential from 1
    parsed.questions.forEach((q: any, index: number) => {
        q.id = index + 1;
    });
    return parsed as ListeningTest;
  } catch (error) {
    console.error("Error generating listening test:", error);
    throw new Error("Failed to generate a listening test from AI.");
  }
}

// FIX: Add function to convert a script to audio.
export async function getAudioForScript(script: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: script }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating audio for script:", error);
        throw new Error("Failed to generate audio from AI.");
    }
}

// FIX: Update function to generate a reading test based on a user-provided topic.
export async function generateReadingTest(topic: string, difficulty: string, questionCount: number): Promise<ReadingTest> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `You are an expert IELTS test creator. Generate a complete IELTS Reading practice test section about the topic: **"${topic}"**.
      The test must be based on this topic. Adhere to the following criteria:
      - **Difficulty Level**: ${difficulty}. This should influence the vocabulary, sentence structure, and complexity of the questions. (e.g., Easy corresponds to Band 5-6, Medium to 6.5-7.5, Hard to 8-9).
      - **Number of Questions**: Exactly ${questionCount}.

      Your response MUST be a JSON object containing the following keys:
      1.  "id": A unique string identifier.
      2.  "topic": A brief, one-sentence description of the passage's content, based on the provided topic.
      3.  "passage": The full reading passage. The passage length should be appropriate for the number of questions (approx. 150-200 words per question).
      4.  "questions": An array of exactly ${questionCount} multiple-choice question objects. Each object must have:
          a. "id": A number (1, 2, 3, ...).
          b. "questionText": The full text of the question.
          c. "options": An array of exactly 4 string options (A, B, C, D).
          d. "answer": The correct answer as a string. This answer MUST be one of the provided options.

      Ensure the questions test a range of reading skills and are answerable based ONLY on the information in the passage.
      Return ONLY the specified JSON object.`,
      config: {
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            topic: { type: Type.STRING },
            passage: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  questionText: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING }
                },
                required: ["id", "questionText", "options", "answer"]
              }
            }
          },
          required: ["id", "topic", "passage", "questions"]
        }
      }
    });
    const parsed = JSON.parse(response.text.trim());
    // Ensure question IDs are sequential from 1
    parsed.questions.forEach((q: any, index: number) => {
        q.id = index + 1;
    });
    return parsed as ReadingTest;
  } catch (error) {
    console.error("Error generating reading test:", error);
    throw new Error("Failed to generate a reading test from AI.");
  }
}