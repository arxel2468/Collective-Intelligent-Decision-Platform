import axios from 'axios';

const API_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization header:", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// User API
export const userApi = {
  login: (username: string, password: string) => 
    api.post('/users/login', { username, password }),
  
  register: (username: string, email: string, password: string) => 
    api.post('/users/register', { username, email, password }),
  
  getProfile: () => api.get('/users/me'),
};

// Workspace API
export const workspaceApi = {
  getWorkspaces: () => api.get('/workspaces'),
  
  createWorkspace: (name: string, description: string) => 
    api.post('/workspaces', { name, description }),
  
  getWorkspace: (workspaceId: string) => 
    api.get(`/workspaces/${workspaceId}`),

  // Get workspace members
  getWorkspaceMembers: (workspaceId: string) => 
    api.get(`/workspaces/${workspaceId}/members`),

  // Add workspace member
  addWorkspaceMember: (workspaceId: string, username: string) => 
    api.post(`/workspaces/${workspaceId}/members`, { username }),
};

// Discussion API
export const discussionApi = {
  getDiscussions: (workspaceId: string) => 
    api.get(`/workspaces/${workspaceId}/discussions`),
  
  createDiscussion: (workspaceId: string, title: string, description: string) => 
    api.post(`/workspaces/${workspaceId}/discussions`, { title, description }),
  
  getMessages: (discussionId: string) => 
    api.get(`/discussions/${discussionId}/messages`),
  
  postMessage: (discussionId: string, content: string, parentId?: string) => 
    api.post(`/discussions/${discussionId}/messages`, { content, parent_id: parentId }),
};

// Analysis API
export const analysisApi = {
  // Get analysis for a specific message
  getMessageAnalysis: (messageId: string) => 
    api.get(`/messages/${messageId}/analysis`),
  
  // Trigger analysis for a message
  analyzeMessage: (messageId: string) => 
    api.post(`/messages/${messageId}/analyze`),
  
  // Get all analyses for a discussion
  getDiscussionAnalysis: (discussionId: string) => 
    api.get(`/discussions/${discussionId}/analysis`),
  
  // Get list of cognitive biases
  getCognitiveBiases: () => 
    api.get(`/biases`),
};

// Decision API
export const decisionApi = {
  // Get decision process for a discussion
  getDecisionProcess: (discussionId: string) => 
    api.get(`/discussions/${discussionId}/decision-process`),
  
  // Create a new decision process
  createDecisionProcess: (discussionId: string, title: string) => {
    console.log(`Creating decision process for discussion ${discussionId} with title "${title}"`);
    return api.post(`/discussions/${discussionId}/decision-process`, { title });
  },
  
  // Update a decision stage
  updateDecisionStage: (stageId: string, status: string) => 
    api.patch(`/decision-stages/${stageId}`, { status }),
  
  // Get decision document
  getDecisionDocument: (processId: string) => 
    api.get(`/decision-processes/${processId}/document`),
  
  // Create decision document
  createDecisionDocument: (processId: string, title: string, content: string) => 
    api.post(`/decision-processes/${processId}/document`, { title, content }),
  
  // Update decision document
  updateDecisionDocument: (documentId: string, title: string, content: string) => 
    api.put(`/decision-documents/${documentId}`, { title, content }),
};



export default api;
