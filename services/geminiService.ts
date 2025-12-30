
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language, VocabularyWord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLesson = async (language: Language, topic?: string): Promise<VocabularyWord[]> => {
  const languageName = language === Language.ENGLISH ? "English" : "Simplified Chinese";
  const prompt = `Generate a list of EXACTLY 10 useful ${languageName} words for a language learner. 
    ${topic ? `The words MUST be strictly related to the topic: "${topic}".` : "The words should be of intermediate difficulty and commonly used."}
    Provide all definitions and translations in Vietnamese.
    Ensure the words are diverse (different parts of speech if possible).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING, description: "The word in the target language" },
            phonetic: { type: Type.STRING, description: "Phonetic transcription or Pinyin" },
            meaning: { type: Type.STRING, description: "Definition in Vietnamese" },
            part_of_speech: { type: Type.STRING, description: "Noun, Verb, Adjective, etc." },
            example: { type: Type.STRING, description: "An example sentence in the target language" },
            example_translation: { type: Type.STRING, description: "The Vietnamese translation of the example sentence" },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Related sub-topics" }
          },
          required: ["word", "phonetic", "meaning", "part_of_speech", "example", "example_translation", "tags"]
        }
      }
    }
  });

  try {
    const words = JSON.parse(response.text);
    return Array.isArray(words) ? words : [];
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return [];
  }
};

export const getPronunciation = async (text: string, language: Language): Promise<Uint8Array> => {
  const voiceName = language === Language.ENGLISH ? 'Kore' : 'Puck'; 
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data returned");

  return decodeBase64(base64Audio);
};

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
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
