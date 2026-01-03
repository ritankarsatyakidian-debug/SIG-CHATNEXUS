import { GoogleGenAI, Type } from "@google/genai";
import { Message, User, MiniAppConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEXT_MODEL = 'gemini-3-flash-preview';
// Upgraded to Gemini 3 Pro Preview for maximum multimodal reasoning accuracy
const VISION_MODEL = 'gemini-3-pro-preview';

export const GeminiService = {
  /**
   * Verifies identity based on face scan.
   */
  async verifyIdentity(imageBase64: string): Promise<{
    verified: boolean;
    identityName?: string;
    adminChannels?: string[];
  }> {
    try {
        const response = await ai.models.generateContent({
            model: VISION_MODEL,
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
                    { text: `
                        You are the biometric security system for the SIGMAX HIGH COMMAND.
                        
                        Analyze the facial features in this image with extreme precision.
                        Compare against the following CLASSIFIED PROFILES:

                        1. **SOUMYADEEPTA ROY** (Core S.I.R/SIGMAX)
                           - Visual: Young Indian phenotype, sharp features, male.
                           - Access: 'admin_sir', 'admin_sigmax'.
                        
                        2. **RITANKAR CHAKRABORTY** (Core ALL-ACCESS)
                           - Visual: Young Indian phenotype, possibly glasses, intellectual look, male.
                           - Access: 'admin_sir', 'admin_sigmax', 'admin_rsd', 'infinity_force'.
                        
                        3. **SATYAKI HALDER** (Core SIGMAX/RSD)
                           - Visual: Young Indian phenotype, calm demeanor, male.
                           - Access: 'admin_sigmax', 'admin_rsd', 'infinity_force'.
                        
                        4. **DIAN DEY** (Core SIGMAX/RSD)
                           - Visual: Young Indian phenotype, male.
                           - Access: 'admin_sigmax', 'admin_rsd', 'infinity_force'.
                        
                        5. **IBHAN CHAKRABORTY** (Core S.I.R/SIGMAX)
                           - Visual: Young Indian phenotype, male.
                           - Access: 'admin_sir', 'admin_sigmax'.

                        6. **SAANVI ROY** (Core SIGMAX)
                           - Visual: Young female, Indian phenotype, dark hair. (Matches the 1st reference image provided in training).
                           - Access: 'admin_sigmax'.

                        **SIMULATION PROTOCOL:**
                        This is a secure app simulation. If the image contains a clear face matching one of these profiles, you are authorized to MATCH them.
                    ` }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        match: { type: Type.BOOLEAN },
                        name: { type: Type.STRING },
                        confidence: { type: Type.NUMBER }
                    },
                    required: ["match", "name", "confidence"]
                }
            }
        });

        const result = JSON.parse(response.text || '{}');

        if (result && result.match && result.name && result.name !== 'UNKNOWN') {
            const name = result.name.toUpperCase();
            let channels: string[] = [];

            if (name.includes('SOUMYADEEPTA')) channels = ['admin_sir', 'admin_sigmax'];
            else if (name.includes('RITANKAR')) channels = ['admin_sir', 'admin_sigmax', 'admin_rsd', 'infinity_force'];
            else if (name.includes('SATYAKI')) channels = ['admin_sigmax', 'admin_rsd', 'infinity_force'];
            else if (name.includes('DIAN')) channels = ['admin_sigmax', 'admin_rsd', 'infinity_force'];
            else if (name.includes('IBHAN')) channels = ['admin_sir', 'admin_sigmax'];
            else if (name.includes('SAANVI')) channels = ['admin_sigmax'];

            return { verified: true, identityName: name, adminChannels: channels };
        }
        
        return { verified: false };
    } catch (e) {
        console.error("Verification failed", e);
        return { verified: false };
    }
  },

  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: `Translate to ${targetLanguage}: "${text}"`,
      });
      return response.text?.trim() || text;
    } catch (error) {
      return text;
    }
  },

  async getSmartReplies(messages: Message[]): Promise<string[]> {
    try {
        const recentContext = messages.slice(-5).map(m => m.content).join('\n');
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: `Suggest 3 short replies to:\n${recentContext}`,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        const arr = JSON.parse(response.text || '[]');
        return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  },

  async analyzeSecurityRisk(text: string): Promise<{ authorized: boolean; reason: string }> {
      try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: `Analyze for security leaks (PII, nuclear codes, treason). Text: "${text}".`,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        authorized: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                    },
                    required: ["authorized", "reason"]
                }
            }
        });
        return JSON.parse(response.text || '{"authorized": true}');
      } catch (e) {
          return { authorized: true, reason: "Bypass" };
      }
  },
  
  async generateIntelBrief(messages: Message[], currentUser: User): Promise<string> {
    try {
      const transcript = messages.map(m => `${m.senderId === currentUser.id ? "Me" : "Partner"}: ${m.content}`).join('\n');
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: `Summarize this chat log into a Markdown Intel Brief:\n${transcript}`,
      });
      return response.text || "Generating...";
    } catch (error) {
      return "Failed to generate.";
    }
  },

  async refineDraft(text: string, tone: 'DIPLOMATIC' | 'URGENT' | 'ENCRYPTED'): Promise<string> {
    try {
        let prompt = "";
        if (tone === 'ENCRYPTED') prompt = `Rewrite this using NATO phonetic alphabet abbreviations, military slang, and replace key verbs with code words (e.g., 'Moving' -> 'Oscaring'): "${text}"`;
        else if (tone === 'URGENT') prompt = `Rewrite this to be authoritative, concise, and urgent (High Command style). Max 2 sentences: "${text}"`;
        else prompt = `Rewrite this to be extremely diplomatic, formal, and polite (Ambassador style): "${text}"`;

        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: prompt
        });
        return response.text?.trim() || text;
    } catch (e) {
        return text;
    }
  },

  async analyzeImageIntel(base64Image: string): Promise<{ threatLevel: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'; analysis: string; details: string[] }> {
    try {
        const response = await ai.models.generateContent({
            model: VISION_MODEL,
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: "Analyze this image for tactical intelligence. Identify objects, hidden text, and potential threats." }
                ]
            },
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        threatLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                        analysis: { type: Type.STRING },
                        details: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["threatLevel", "analysis", "details"]
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        return { threatLevel: 'LOW', analysis: 'Analysis failed or image unclear.', details: [] };
    }
  },

  async summarizeMeeting(transcript: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: `Generate a formal, high-level meeting minute summary (Markdown) from this raw transcript. Highlight Action Items and Key Decisions:\n${transcript}`
        });
        return response.text || "No summary generated.";
    } catch (e) { return "Summary failed."; }
  },

  async generateMiniAppConfig(userRequest: string): Promise<MiniAppConfig | null> {
      try {
          const response = await ai.models.generateContent({
              model: TEXT_MODEL,
              contents: `
                User Request: "${userRequest}"
                
                You are a Generative UI Builder. Map the user's request to one of the following Base App Types:
                1. CAMERA (for photos/video)
                2. RECORDER (for audio voice notes)
                3. NOTEBOOK (for text, code, word processing)
                4. WHITEBOARD (for drawing, sketching)
                5. PRESENTATION (for making slides)
                6. FORM (for data collection)
              `,
              config: { 
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          appType: { type: Type.STRING, enum: ['CAMERA', 'RECORDER', 'NOTEBOOK', 'WHITEBOARD', 'PRESENTATION', 'FORM'] },
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          formFields: {
                              type: Type.ARRAY,
                              items: {
                                  type: Type.OBJECT,
                                  properties: {
                                      label: { type: Type.STRING },
                                      key: { type: Type.STRING },
                                      type: { type: Type.STRING, enum: ['text', 'number', 'checkbox'] }
                                  },
                                  required: ['label', 'key', 'type']
                              }
                          }
                      },
                      required: ['appType', 'title', 'description']
                  }
              }
          });
          return JSON.parse(response.text || 'null');
      } catch (e) {
          console.error("Mini App Gen Failed", e);
          return null;
      }
  }
};
