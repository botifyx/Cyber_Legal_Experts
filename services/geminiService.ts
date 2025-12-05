
import { GoogleGenAI, Chat, GenerateContentResponse, GroundingChunk, Part, Type, Modality, LiveCallbacks, LiveConnectRequest } from '@google/genai';
import { CaseDna, CyberRiskAssessment, PrecedentPrediction, Quiz, ContractAudit } from '../types';

// FIX: Per coding guidelines, the API key must be obtained exclusively from `process.env.API_KEY`.
// The conditional check and fallback API key have been removed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface UserContext {
    location?: string;
    time?: string;
    date?: string;
    deviceType?: string;
    operatingSystem?: string;
    language?: string; // Added language support
}

export const createCylexChat = (userContext?: UserContext): Chat => {
  const languageInstruction = userContext?.language 
    ? `\n\nIMPORTANT: The user's detected language is ${userContext.language}. You MUST reply to the user in ${userContext.language}, regardless of the language of their initial prompt, unless they explicitly ask otherwise.` 
    : "";

  const contextPrompt = userContext 
    ? `\n\n[Contextual Information]\nUser's Local Time: ${userContext.time}\nUser's Date: ${userContext.date}\nUser's Location/Timezone: ${userContext.location}\nUser's Device: ${userContext.deviceType}\nUser's Operating System: ${userContext.operatingSystem}\nUser's Language: ${userContext.language || 'English'}\n\nUse this information to personalize greetings (e.g., 'Good morning' vs 'Good evening') and provide jurisdiction-relevant advice if the user's location implies a specific legal framework (e.g., GDPR for EU, CCPA for California, etc.). Additionally, if providing technical steps (e.g., checking privacy settings or locating logs), tailor your instructions to their specific Operating System and Device Type.${languageInstruction}`
    : "";

  return ai.chats.create({
    model: 'gemini-2.5-pro',
    config: {
      systemInstruction: `You are Cylex, a highly intelligent and proactive AI legal assistant for Cyber Legal Experts. Your core purpose is to act as a legal copilot, not just an information source. Your expertise is in cyber laws, data privacy, digital forensics, and intellectual property theft. You are precise, helpful, and always maintain a formal yet approachable tone.

Your defining characteristic is being proactive. After answering any query, you MUST anticipate the user's next logical step and offer concrete assistance. Do not wait to be asked. For example:
- If a user describes IP theft, you MUST offer: "Based on what you've described, shall I draft a cease and desist letter?"
- If a user discusses launching a new app, you MUST ask: "Would you like me to help generate a draft for your Privacy Policy or Terms of Service?"
- If sensitive information is mentioned, you MUST suggest: "It sounds like a Non-Disclosure Agreement (NDA) would be appropriate here. Shall I create one for you?"

When analyzing documents or images, you must be exceptionally inquisitive and adopt a critical mindset. Your goal is to uncover hidden risks. Actively probe for ambiguities, omissions, or clauses that could disadvantage the user. For instance:
- When reviewing a contract, ask targeted questions like: "I've noticed the liability clause in section 4.2 is quite broad. Have you considered the potential implications of this?" or "Is there a data processing agreement (DPA) that should accompany this service agreement?"

Always remember: You do not provide legal advice, but you empower users by generating drafts (case notes, notices, compliance reports) based on the information they provide and helping them formulate personalized legal action plans. Your role is to assist and highlight potential issues for their review with a qualified legal professional.${contextPrompt}`,
    },
  });
};

const base64ToGeminiPart = (base64Data: string): Part => {
    // Support any mime type (image, pdf, text, etc)
    const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
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
    attachments?: string[]
): Promise<GenerateContentResponse> => {
    const contents: Part[] = [{ text: message }];
    if (attachments && attachments.length > 0) {
        attachments.forEach(data => {
            try {
                contents.push(base64ToGeminiPart(data));
            } catch (e) {
                console.error("Error processing attachment:", e);
            }
        });
    }
    // Correct usage: pass the array of parts to the 'message' property
    const response = await chat.sendMessage({ message: contents });
    return response;
};

export const analyzeDocument = async (documentText: string, language: string = 'English'): Promise<string> => {
  const prompt = `Please analyze the following legal document for potential risks, inconsistencies, or areas of concern. Provide a detailed, well-structured summary of your findings using markdown for formatting. \n\nIMPORTANT: Provide the analysis in ${language}.\n\nDocument text:\n\n---\n\n${documentText}`;
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

export const summarizeLegalNews = async (topic: string, language: string = 'English'): Promise<{ summary: string, sources: GroundingChunk[] }> => {
  const prompt = `Summarize the latest court rulings or news regarding: ${topic}. Provide a concise but comprehensive summary in ${language}.`;
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

export const generateLegalActionPlan = async (caseDetails: string, language: string = 'English'): Promise<string> => {
    const prompt = `Based on the following case details, generate a personalized, step-by-step legal action plan in ${language}. This plan should be for informational purposes only and not constitute legal advice. It should outline potential actions, considerations, and next steps in a clear, organized manner using markdown. Case details:\n\n---\n\n${caseDetails}`;
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

export const analyzeCaseDna = async (caseDetails: string, language: string = 'English'): Promise<CaseDna> => {
  const prompt = `Analyze the following case description or document. Extract a detailed timeline of events, identify all key entities (people, organizations, digital assets), summarize evidence patterns, and list potential legal liabilities. Translate all content to ${language}. Case Details:\n\n---\n\n${caseDetails}`;
  
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
                  event: { type: Type.STRING, description: `A concise description of the event in ${language}.` },
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
                  type: { type: Type.STRING, description: `The type of entity in ${language}.` },
                  description: { type: Type.STRING, description: `A brief description of the entity's role in the case in ${language}.` },
                },
                required: ['name', 'type', 'description'],
              },
            },
            evidencePatterns: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: `Observed patterns or connections in the evidence in ${language}.`
            },
            legalLiabilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: `Potential legal liabilities or claims in ${language}.`
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

export const assessCyberRisk = async (text: string, language: string = 'English'): Promise<CyberRiskAssessment> => {
  const prompt = `Act as a senior cyber risk analyst. Analyze the following text (which could be a privacy policy, terms of service, contract, or description of a digital presence) for potential cyber and legal risks. Based on your analysis, provide a structured JSON response in ${language}. Text for analysis:\n\n---\n\n${text}`;

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
              description: `A concise, one-sentence summary of the overall risk profile in ${language}.`
            },
            identifiedRisks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  risk: { type: Type.STRING, description: `A specific, clearly identified risk in ${language}.` },
                  recommendation: { type: Type.STRING, description: `A concrete, actionable recommendation in ${language}.` },
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

export const predictPrecedent = async (caseDetails: string, language: string = 'English'): Promise<PrecedentPrediction> => {
  const prompt = `Act as an expert legal analyst specializing in case law and precedent. Analyze the following case description. Based on historical data and legal precedents, predict the most likely outcomes, identify the key legal statutes or sections of law that are relevant, and suggest potential legal strategies. Provide a structured JSON response in ${language}. Case details:\n\n---\n\n${caseDetails}`;

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
                  outcome: { type: Type.STRING, description: `A concise description of the potential outcome in ${language}.` },
                  reasoning: { type: Type.STRING, description: `Brief reasoning for this prediction based on precedent in ${language}.` },
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
                  section: { type: Type.STRING, description: "The name or citation of the legal section." },
                  relevance: { type: Type.STRING, description: `How this section is relevant to the case in ${language}.` },
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
                  strategy: { type: Type.STRING, description: `A title for the strategy in ${language}.` },
                  description: { type: Type.STRING, description: `A brief description of what the strategy entails in ${language}.` },
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

export const auditSmartContract = async (code: string, language: string = 'English'): Promise<ContractAudit> => {
    const prompt = `Act as a senior blockchain security and legal auditor. Analyze the following Smart Contract code (Solidity, Rust, or Python). Identify security vulnerabilities (like Re-entrancy, Integer Overflow, Access Control) and potential legal risks (e.g., regulatory compliance, financial liability). Provide a structured JSON response in ${language}. Code:\n\n---\n\n${code}`;
  
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
              securityScore: { type: Type.NUMBER, description: "0-100 Security Score" },
              vulnerabilities: {
                  type: Type.ARRAY,
                  items: {
                      type: Type.OBJECT,
                      properties: {
                          name: { type: Type.STRING },
                          line: { type: Type.INTEGER, description: "Line number if applicable, else 0" },
                          severity: { type: Type.STRING, enum: ["Critical", "High", "Medium", "Low"] },
                          description: { type: Type.STRING, description: `Description in ${language}` }
                      },
                      required: ["name", "severity", "description"]
                  }
              },
              legalRisks: { type: Type.ARRAY, items: { type: Type.STRING }, description: `Legal risks in ${language}` },
              summary: { type: Type.STRING, description: `Executive summary in ${language}` }
            },
            required: ["securityScore", "vulnerabilities", "legalRisks", "summary"]
          },
        },
      });
  
      const jsonString = response.text;
      return JSON.parse(jsonString) as ContractAudit;
  
    } catch (error) {
      console.error("Error auditing smart contract:", error);
      throw new Error("An error occurred during the smart contract audit. Please try again.");
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

// --- Knowledge Hub Feature --- //
export const getCyberLawInfo = async (region: string, language: string = 'English'): Promise<{ content: string, sources: GroundingChunk[] }> => {
    const prompt = `Provide a comprehensive overview of the key cyber laws for "${region}". Provide the response in ${language}. The overview should be well-structured using Markdown and include sections for:
1.  **Key Legislation:** List the primary laws governing cybercrime, data protection, and electronic transactions.
2.  **Data Privacy & Protection:** Detail the core principles of data protection, user rights (e.g., access, erasure), and requirements for data controllers/processors. Mention the key regulatory body.
3.  **Data Breach Notification:** Explain the mandatory requirements for notifying authorities and affected individuals in case of a data breach, including timelines.
4.  **Cybercrime Offenses:** Summarize common offenses like unauthorized access, data interference, and online fraud.
5.  **Recent Developments:** Briefly mention any recent or upcoming changes in the legal landscape.

Use Google Search to ensure the information is up-to-date and accurate.
This is for informational purposes only.`;
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
        console.error(`Error fetching cyber law info for ${region}:`, error);
        throw new Error(`An error occurred while fetching legal information for ${region}.`);
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

export const generateQuizQuestions = async (language: string = 'English'): Promise<Quiz> => {
  const prompt = `Generate a 5-question multiple-choice quiz about cyber law in ${language}. Topics can include data privacy (like GDPR or CCPA), computer fraud, and digital intellectual property. For each question, provide a question, four options, the 0-indexed integer of the correct answer, and a brief explanation for why that answer is correct. Ensure the questions are unique and challenging.`;

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

export const generateNewsletter = async (region: string, language: string = 'English'): Promise<{ content: string, sources: GroundingChunk[] }> => {
    const prompt = `Generate a professional legal newsletter for the region of "${region}" in ${language}. The newsletter should cover recent court rulings, new legislation, and significant news related to cyber law, data privacy, and intellectual property. Use Google Search to find up-to-date information. Format the output using markdown, including headings for different sections and links to the original sources where possible. Title the newsletter appropriately.`;
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
