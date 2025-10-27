import { GroundingChunk } from '@google/genai';

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  image?: string; // Optional base64 data URL for images
}

export interface GroundingSource extends GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

// Types for Case DNA Analyzer
export interface TimelineEvent {
  date: string;
  event: string;
}

export interface Entity {
  name: string;
  type: 'Person' | 'Organization' | 'Digital Asset' | 'Other';
  description: string;
}

export interface CaseDna {
  timeline: TimelineEvent[];
  entities: Entity[];
  evidencePatterns: string[];
  legalLiabilities: string[];
}

// Types for Cyber Risk Meter
export interface IdentifiedRisk {
  risk: string;
  recommendation: string;
}

export interface CyberRiskAssessment {
  riskScore: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  summary: string;
  identifiedRisks: IdentifiedRisk[];
}

// Types for Precedent Predictor
export interface PredictedOutcome {
  outcome: string;
  reasoning: string;
  confidenceScore: 'High' | 'Medium' | 'Low';
  likelihoodPercentage: number; // 0-100
}

export interface LegalSection {
  section: string;
  relevance: string;
}

export interface SuggestedStrategy {
  strategy: string;
  description: string;
}

export interface PrecedentPrediction {
  predictedOutcomes: PredictedOutcome[];
  keyLegalSections: LegalSection[];
  suggestedStrategies: SuggestedStrategy[];
}

// Types for Cyber Law Insights
export interface Article {
  id: number;
  title: string;
  author: string;
  date: string;
  snippet: string;
  content: string;
}

// Types for AI Labs
export interface Experiment {
  id: number;
  title: string;
  description: string;
  status: 'Experimental' | 'In Development' | 'Concept';
}

// Types for About Us Timeline
export interface TimelineMilestone {
  year: string;
  title: string;
  description: string;
  type: 'law' | 'ai';
}

// Types for Engagement Hub - Quiz
export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export type Quiz = QuizQuestion[];