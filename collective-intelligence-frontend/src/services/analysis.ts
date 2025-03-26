// src/services/analysis.ts
import axios from 'axios';

// Types
export interface MessageAnalysis {
  id: string;
  message_id: string;
  sentiment_score: number;
  perspective_vector: {
    dimensions: string[];
    values: number[];
  };
  detected_biases: {
    biases: Array<{
      name: string;
      confidence: number;
      evidence: string;
    }>;
  };
  analyzed_at: string;
}

export interface BiasInfo {
  id: string;
  name: string;
  description: string;
  detection_patterns: string[];
  mitigation_strategies: string;
}

// API functions
export const analysisApi = {
  // Get analysis for a specific message
  getMessageAnalysis: (messageId: string) => 
    axios.get<MessageAnalysis>(`/api/messages/${messageId}/analysis`),
  
  // Trigger analysis for a message
  analyzeMessage: (messageId: string) => 
    axios.post<MessageAnalysis>(`/api/messages/${messageId}/analyze`),
  
  // Get all analyses for a discussion
  getDiscussionAnalysis: (discussionId: string) => 
    axios.get<{ analyses: MessageAnalysis[] }>(`/api/discussions/${discussionId}/analysis`),
  
  // Get list of cognitive biases
  getCognitiveBiases: () => 
    axios.get<{ biases: BiasInfo[] }>('/api/biases'),
  
  // Seed the database with common cognitive biases (admin only)
  seedBiases: () => 
    axios.post<{ message: string, count: number }>('/api/seed/biases')
};