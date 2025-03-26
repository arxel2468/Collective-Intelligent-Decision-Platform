// src/hooks/useAnalysis.ts
import { useState, useEffect } from 'react';
import { analysisApi, MessageAnalysis, BiasInfo } from '../services/analysis';

export function useMessageAnalysis(messageId: string | null) {
  const [analysis, setAnalysis] = useState<MessageAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!messageId) return;

    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await analysisApi.getMessageAnalysis(messageId);
        setAnalysis(response.data);
      } catch (err: any) {
        // If 404, it means no analysis exists yet
        if (err.response?.status === 404) {
          // Try to trigger analysis
          try {
            const analysisResponse = await analysisApi.analyzeMessage(messageId);
            setAnalysis(analysisResponse.data);
          } catch (analysisErr: any) {
            setError(analysisErr.response?.data?.message || 'Failed to analyze message');
          }
        } else {
          setError(err.response?.data?.message || 'Failed to fetch analysis');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [messageId]);

  return { analysis, isLoading, error };
}

export function useDiscussionAnalysis(discussionId: string | null) {
  const [analyses, setAnalyses] = useState<MessageAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!discussionId) return;

    const fetchAnalyses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await analysisApi.getDiscussionAnalysis(discussionId);
        setAnalyses(response.data.analyses || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch analyses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyses();
  }, [discussionId]);

  return { analyses, isLoading, error };
}

export function useCognitiveBiases() {
  const [biases, setBiases] = useState<BiasInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBiases = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await analysisApi.getCognitiveBiases();
        setBiases(response.data.biases || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch cognitive biases');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBiases();
  }, []);

  return { biases, isLoading, error };
}