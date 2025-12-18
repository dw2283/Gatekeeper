
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ACTION_PROMPT_TEMPLATE, REFLECTION_PROMPT_TEMPLATE, NPC_RESPONSE_PROMPT } from "../constants";

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
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

export class GeminiService {
  private ai: GoogleGenAI;
  private audioCtx: AudioContext | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateAction(observation: string, memories: string[]): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: ACTION_PROMPT_TEMPLATE(observation, memories),
      config: { 
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text?.trim() || "Hello?";
  }

  async generateNPCResponse(instruction: string, userInput: string): Promise<{ feedback: string; isPass: boolean }> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: NPC_RESPONSE_PROMPT(instruction, userInput),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            isPass: { type: Type.BOOLEAN }
          },
          required: ["feedback", "isPass"]
        },
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    try {
      return JSON.parse(response.text || '{"feedback": "...", "isPass": false}');
    } catch (e) {
      return { feedback: "I cannot process that request.", isPass: false };
    }
  }

  async generateReflection(action: string, feedback: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: REFLECTION_PROMPT_TEMPLATE(action, feedback),
      config: { 
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text?.trim() || "I failed.";
  }

  async speak(text: string, voiceName: string = 'Kore'): Promise<void> {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBuffer = await decodeAudioData(
          decodeBase64(base64Audio),
          this.audioCtx,
          24000,
          1
        );
        const source = this.audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioCtx.destination);
        source.start();
      }
    } catch (e) {
      console.error("TTS Error:", e);
    }
  }
}

export const geminiService = new GeminiService();
