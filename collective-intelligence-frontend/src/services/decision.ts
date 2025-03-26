// src/services/decision.ts
import axios from 'axios';

// Types
export interface DecisionProcess {
  id: string;
  discussion_id: string;
  title: string;
  status: string;
  process_template: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface DecisionStage {
  id: string;
  process_id: string;
  name: string;
  description: string;
  order_index: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface DecisionDocument {
  id: string;
  process_id: string;
  title: string;
  content: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface DecisionMetric {
  id: string;
  process_id: string;
  metric_name: string;
  metric_value: number;
  calculated_at: string;
}

// API functions
export const decisionApi = {
  // Get decision process for a discussion
  getDecisionProcess: (discussionId: string) => 
    axios.get<{ process: DecisionProcess, stages: DecisionStage[] }>(
      `/api/discussions/${discussionId}/decision-process`
    ),
  
  // Create a new decision process
  createDecisionProcess: (discussionId: string, title: string, template?: string) => 
    axios.post<{ process: DecisionProcess, stages: DecisionStage[] }>(
      `/api/discussions/${discussionId}/decision-process`,
      { title, template }
    ),
  
  // Update a decision stage
  updateDecisionStage: (stageId: string, status: string) => 
    axios.patch<DecisionStage>(`/api/decision-stages/${stageId}`, { status }),
  
  // Get decision document
  getDecisionDocument: (processId: string) => 
    axios.get<{ document: DecisionDocument }>(`/api/decision-processes/${processId}/document`),
  
  // Create decision document
  createDecisionDocument: (processId: string, title: string, content: string) => 
    axios.post<{ document: DecisionDocument }>(
      `/api/decision-processes/${processId}/document`,
      { title, content }
    ),
  
  // Update decision document
  updateDecisionDocument: (documentId: string, title: string, content: string) => 
    axios.put<{ document: DecisionDocument }>(
      `/api/decision-documents/${documentId}`,
      { title, content }
    ),
  
  // Get decision metrics
  getDecisionMetrics: (processId: string) => 
    axios.get<{ metrics: DecisionMetric[] }>(`/api/decision-processes/${processId}/metrics`)
};