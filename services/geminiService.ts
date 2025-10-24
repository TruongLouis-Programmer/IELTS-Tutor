import { GoogleGenAI, Type } from "@google/genai";
import { RealtimeFeedback, DetailedFeedback, GrammarError } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

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
      contents: `You are an expert IELTS writing examiner with a reputation for being fair, constructive, and encouraging. Your goal is to help the student improve. Provide a detailed evaluation of the following essay written on the topic: '${topic}'.

      Essay:
      ---
      ${essayText}
      ---

      Your evaluation should be thorough and follow the official IELTS band descriptors, but maintain a positive and supportive tone. Be realistic with your scoring, but avoid being overly strict. Provide the following in your response:
      1.  **Overall Band Score**: A single number from 1.0 to 9.0.
      2.  **Task Achievement**: A detailed paragraph evaluating how well the writer addressed all parts of the task.
      3.  **Coherence and Cohesion**: A detailed paragraph evaluating the organization, paragraphing, and use of linking devices.
      4.  **Lexical Resource**: A detailed paragraph evaluating the range and accuracy of vocabulary.
      5.  **Grammatical Range and Accuracy**: A detailed paragraph evaluating the range and accuracy of grammatical structures.
      6.  **Strengths**: A bulleted list of 2-3 key strengths of the essay. Start with what the writer did well.
      7.  **Areas for Improvement**: A bulleted list of 2-3 specific, actionable suggestions for improvement. Frame these as constructive advice rather than criticism.

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
            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["overallBand", "taskAchievement", "coherenceAndCohesion", "lexicalResource", "grammaticalRangeAndAccuracy", "strengths", "areasForImprovement"]
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