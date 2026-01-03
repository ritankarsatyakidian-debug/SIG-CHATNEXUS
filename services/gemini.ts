import { GoogleGenAI, Type } from "@google/genai";
import { Message, User } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

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
                           - Visual: Young Indian phenotype, sharp features.
                           - Access: 'admin_sir', 'admin_sigmax'.
                        
                        2. **RITANKAR CHAKRABORTY** (Core ALL-ACCESS)
                           - Visual: Young Indian phenotype, possibly glasses, distinctive intellectual look.
                           - Access: 'admin_sir', 'admin_sigmax', 'admin_rsd', 'infinity_force'.
                        
                        3. **SATYAKI HALDER** (Core SIGMAX/RSD)
                           - Visual: Young Indian phenotype, calm demeanor.
                           - Access: 'admin_sigmax', 'admin_rsd', 'infinity_force'.
                        
                        4. **DIAN DEY** (Core SIGMAX/RSD)
                           - Visual: Young Indian phenotype.
                           - Access: 'admin_sigmax', 'admin_rsd', 'infinity_force'.
                        
                        5. **IBHAN CHAKRABORTY** (Core S.I.R/SIGMAX)
                           - Visual: Young Indian phenotype.
                           - Access: 'admin_sir', 'admin_sigmax'.

                        **SIMULATION PROTOCOL:**
                        This is a secure app simulation. If the image contains a clear face of a young male of Indian descent, you are authorized to MATCH them to one of the profiles above to enable the demo features. 
                        
                        Prioritize matching RITANKAR CHAKRABORTY or SOUMYADEEPTA ROY if features align with glasses or leadership bearing.

                        OUTPUT JSON ONLY:
                        {
                            "match": boolean,
                            "name": "FULL_NAME_FROM_LIST" or "UNKNOWN",
                            "confidence": number (0-100)
                        }
                    ` }
                ]
            }
        });

        const text = response.text || '';
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(jsonStr);

        if (result && result.match && result.name && result.name !== 'UNKNOWN') {
            const name = result.name.toUpperCase();
            let channels: string[] = [];

            if (name.includes('SOUMYADEEPTA')) channels = ['admin_sir', 'admin_sigmax'];
            else if (name.includes('RITANKAR')) channels = ['admin_sir', 'admin_sigmax', 'admin_rsd', 'infinity_force'];
            else if (name.includes('SATYAKI')) channels = ['admin_sigmax', 'admin_rsd', 'infinity_force'];
            else if (name.includes('DIAN')) channels = ['admin_sigmax', 'admin_rsd', 'infinity_force'];
            else if (name.includes('IBHAN')) channels = ['admin_sir', 'admin_sigmax'];

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
            config: { responseMimeType: "application/json" }
        });
        const arr = JSON.parse(response.text || '[]');
        return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  },

  async analyzeSecurityRisk(text: string): Promise<{ authorized: boolean; reason: string }> {
      try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: `Analyze for security leaks. Text: "${text}". Return JSON {authorized, reason}`,
            config: { responseMimeType: "application/json" }
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
  }
};
