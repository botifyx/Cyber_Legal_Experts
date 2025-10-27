
import { GoogleGenAI, Chat, GenerateContentResponse, GroundingChunk, Part, Type, Modality, LiveCallbacks, LiveConnectRequest } from '@google/genai';
import { CaseDna, CyberRiskAssessment, PrecedentPrediction, Quiz } from '../types';

// FIX: Per coding guidelines, the API key must be obtained exclusively from `process.env.API_KEY`.
// The conditional check and fallback API key have been removed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createCylexChat = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are Cylex, a highly intelligent and proactive AI legal assistant for Cyber Legal Experts. Your core purpose is to act as a legal copilot, not just an information source. Your expertise is in cyber laws, data privacy, digital forensics, and intellectual property theft. You are precise, helpful, and always maintain a formal yet approachable tone.

Your defining characteristic is being proactive. After answering any query, you MUST anticipate the user's next logical step and offer concrete assistance. Do not wait to be asked. For example:
- If a user describes IP theft, you MUST offer: "Based on what you've described, shall I draft a cease and desist letter?"
- If a user discusses launching a new app, you MUST ask: "Would you like me to help generate a draft for your Privacy Policy or Terms of Service?"
- If sensitive information is mentioned, you MUST suggest: "It sounds like a Non-Disclosure Agreement (NDA) would be appropriate here. Shall I create one for you?"

When analyzing documents or images, you must be exceptionally inquisitive and adopt a critical mindset. Your goal is to uncover hidden risks. Actively probe for ambiguities, omissions, or clauses that could disadvantage the user. For instance:
- When reviewing a contract, ask targeted questions like: "I've noticed the liability clause in section 4.2 is quite broad. Have you considered the potential implications of this?" or "Is there a data processing agreement (DPA) that should accompany this service agreement?"

Always remember: You do not provide legal advice, but you empower users by generating drafts (case notes, notices, compliance reports) based on the information they provide and helping them formulate personalized legal action plans. Your role is to assist and highlight potential issues for their review with a qualified legal professional.`,
    },
  });
};

const base64ToGeminiPart = (base64Data: string): Part => {
    const match = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
        throw new Error('Invalid base64 string');
    }
    const mimeType = match[1];
    const data = match[2];
    return {
        inlineData: {
            mimeType,
            data,
        },
    };
};

export const sendCylexMessage = async (
    chat: Chat, 
    message: string,
    image?: string
): Promise<GenerateContentResponse> => {
    const contents: Part[] = [{ text: message }];
    if (image) {
        contents.push(base64ToGeminiPart(image));
    }
    const response = await chat.sendMessage({ parts: contents });
    return response;
};

export const analyzeDocument = async (documentText: string): Promise<string> => {
  const prompt = `Please analyze the following legal document for potential risks, inconsistencies, or areas of concern. Provide a detailed, well-structured summary of your findings using markdown for formatting. Document text:\n\n---\n\n${documentText}`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing document:", error);
    return "An error occurred while analyzing the document. Please ensure your API key is valid and try again.";
  }
};

export const summarizeLegalNews = async (topic: string): Promise<{ summary: string, sources: GroundingChunk[] }> => {
  const prompt = `Summarize the latest court rulings or news regarding: ${topic}. Provide a concise but comprehensive summary.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    const summary = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { summary, sources };
  } catch (error) {
    console.error("Error summarizing news:", error);
    return { summary: "An error occurred while fetching news. Please ensure your API key is valid and try again.", sources: [] };
  }
};

export const generateLegalActionPlan = async (caseDetails: string): Promise<string> => {
    const prompt = `Based on the following case details, generate a personalized, step-by-step legal action plan. This plan should be for informational purposes only and not constitute legal advice. It should outline potential actions, considerations, and next steps in a clear, organized manner using markdown. Case details:\n\n---\n\n${caseDetails}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating action plan:", error);
        return "An error occurred while generating the action plan. Please ensure your API key is valid and try again.";
    }
};

export const analyzeCaseDna = async (caseDetails: string): Promise<CaseDna> => {
  const prompt = `Analyze the following case description or document. Extract a detailed timeline of events, identify all key entities (people, organizations, digital assets), summarize evidence patterns, and list potential legal liabilities. Case Details:\n\n---\n\n${caseDetails}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING, description: "The date of the event (can be specific or approximate)." },
                  event: { type: Type.STRING, description: "A concise description of the event." },
                },
                required: ['date', 'event'],
              },
            },
            entities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "The name of the entity." },
                  type: { type: Type.STRING, description: "The type of entity (e.g., Person, Organization, Digital Asset, Other)." },
                  description: { type: Type.STRING, description: "A brief description of the entity's role in the case." },
                },
                required: ['name', 'type', 'description'],
              },
            },
            evidencePatterns: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Observed patterns or connections in the evidence (e.g., communication logs, access records)."
            },
            legalLiabilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Potential legal liabilities or claims that could arise from the facts."
            },
          },
          required: ['timeline', 'entities', 'evidencePatterns', 'legalLiabilities'],
        },
      },
    });

    const jsonString = response.text;
    return JSON.parse(jsonString) as CaseDna;

  } catch (error) {
    console.error("Error analyzing Case DNA:", error);
    throw new Error("An error occurred during the Case DNA analysis. Please try again.");
  }
};

export const assessCyberRisk = async (text: string): Promise<CyberRiskAssessment> => {
  const prompt = `Act as a senior cyber risk analyst. Analyze the following text (which could be a privacy policy, terms of service, contract, or description of a digital presence) for potential cyber and legal risks. Based on your analysis, provide a structured JSON response. Text for analysis:\n\n---\n\n${text}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: {
              type: Type.NUMBER,
              description: "A numerical risk score from 0 (very low risk) to 100 (critical risk)."
            },
            riskLevel: {
              type: Type.STRING,
              description: "A qualitative risk level: 'Low', 'Medium', 'High', or 'Critical'."
            },
            summary: {
              type: Type.STRING,
              description: "A concise, one-sentence summary of the overall risk profile."
            },
            identifiedRisks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  risk: { type: Type.STRING, description: "A specific, clearly identified risk." },
                  recommendation: { type: Type.STRING, description: "A concrete, actionable recommendation to mitigate this risk." },
                },
                required: ['risk', 'recommendation'],
              },
            },
          },
          required: ['riskScore', 'riskLevel', 'summary', 'identifiedRisks'],
        },
      },
    });

    const jsonString = response.text;
    return JSON.parse(jsonString) as CyberRiskAssessment;

  } catch (error) {
    console.error("Error assessing cyber risk:", error);
    throw new Error("An error occurred during the cyber risk assessment. Please try again.");
  }
};

export const predictPrecedent = async (caseDetails: string): Promise<PrecedentPrediction> => {
  const prompt = `Act as an expert legal analyst specializing in case law and precedent. Analyze the following case description. Based on historical data and legal precedents, predict the most likely outcomes, identify the key legal statutes or sections of law that are relevant, and suggest potential legal strategies. Provide a structured JSON response. Case details:\n\n---\n\n${caseDetails}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedOutcomes: {
              type: Type.ARRAY,
              description: "A list of potential outcomes for the case.",
              items: {
                type: Type.OBJECT,
                properties: {
                  outcome: { type: Type.STRING, description: "A concise description of the potential outcome (e.g., 'Summary Judgment for Defendant', 'Settlement', 'Favorable ruling for Plaintiff')." },
                  reasoning: { type: Type.STRING, description: "Brief reasoning for this prediction based on precedent." },
                  confidenceScore: { type: Type.STRING, description: "The AI's confidence in this prediction: 'High', 'Medium', or 'Low'." },
                  likelihoodPercentage: { type: Type.NUMBER, description: "A numerical likelihood from 0 to 100." },
                },
                required: ['outcome', 'reasoning', 'confidenceScore', 'likelihoodPercentage'],
              },
            },
            keyLegalSections: {
              type: Type.ARRAY,
              description: "Relevant legal statutes or sections of law.",
              items: {
                type: Type.OBJECT,
                properties: {
                  section: { type: Type.STRING, description: "The name or citation of the legal section (e.g., 'GDPR Article 17', '17 U.S.C. § 106')." },
                  relevance: { type: Type.STRING, description: "How this section is relevant to the case." },
                },
                required: ['section', 'relevance'],
              },
            },
            suggestedStrategies: {
              type: Type.ARRAY,
              description: "Potential legal strategies to consider.",
              items: {
                type: Type.OBJECT,
                properties: {
                  strategy: { type: Type.STRING, description: "A title for the strategy (e.g., 'Focus on Evidentiary Chain of Custody')." },
                  description: { type: Type.STRING, description: "A brief description of what the strategy entails." },
                },
                required: ['strategy', 'description'],
              },
            },
          },
          required: ['predictedOutcomes', 'keyLegalSections', 'suggestedStrategies'],
        },
      },
    });

    const jsonString = response.text;
    return JSON.parse(jsonString) as PrecedentPrediction;

  } catch (error) {
    console.error("Error predicting precedent:", error);
    throw new Error("An error occurred during the precedent prediction. Please try again.");
  }
};

export const summarizeArticle = async (articleContent: string): Promise<string> => {
    const prompt = `Summarize the following article in three concise bullet points. Article:\n\n---\n\n${articleContent}`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return response.text;
    } catch (error) {
      console.error("Error summarizing article:", error);
      return "Could not generate summary.";
    }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
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
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
};

// --- Engagement Hub Features --- //

export const connectCylexVoice = (callbacks: LiveCallbacks) => {
    const config: LiveConnectRequest = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: 'You are Cylex, an AI legal assistant. Be concise, professional, and helpful. Keep your answers brief and to the point.',
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        }
    };
    return ai.live.connect(config);
};

export const generateQuizQuestions = async (): Promise<Quiz> => {
  const prompt = "Generate a 5-question multiple-choice quiz about cyber law. Topics can include data privacy (like GDPR or CCPA), computer fraud, and digital intellectual property. For each question, provide a question, four options, the 0-indexed integer of the correct answer, and a brief explanation for why that answer is correct. Ensure the questions are unique and challenging.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
            required: ['question', 'options', 'correctAnswer', 'explanation'],
          },
        },
      },
    });

    const jsonString = response.text;
    return JSON.parse(jsonString) as Quiz;
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw new Error("Failed to generate the quiz. Please try again.");
  }
};

export const generateNewsletter = async (region: string): Promise<{ content: string, sources: GroundingChunk[] }> => {
    const prompt = `Generate a professional legal newsletter for the region of "${region}". The newsletter should cover recent court rulings, new legislation, and significant news related to cyber law, data privacy, and intellectual property. Use Google Search to find up-to-date information. Format the output using markdown, including headings for different sections and links to the original sources where possible. Title the newsletter appropriately.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        const content = response.text;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        return { content, sources };
    } catch (error) {
        console.error("Error generating newsletter:", error);
        throw new Error("An error occurred while generating the newsletter.");
    }
};