// src/components/discussion/Discussion.tsx (updated version with Decision Process)
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { discussionApi } from '../../services/api';
import Navbar from '../layout/Navbar';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import BiasDetectionPanel from '../visualization/BiasDetectionPanel';
import PerspectiveMap from '../visualization/PerspectiveMap';
import DecisionProcess from '../decision/DecisionProcess';

interface Discussion {
  id: string;
  title: string;
  description: string;
  workspace_id: string;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  username: string;
  created_at: string;
  parent_id: string | null;
}

const Discussion: React.FC = () => {
  const { discussionId } = useParams<{ discussionId: string }>();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showDecision, setShowDecision] = useState(false);

  useEffect(() => {
    if (discussionId) {
      fetchDiscussionData();
    }
  }, [discussionId]);

  const fetchDiscussionData = async () => {
    setIsLoading(true);
    try {
      // First get the messages
      const messagesResponse = await discussionApi.getMessages(discussionId!);
      setMessages(messagesResponse.data.messages);
      
      // For now, use a hardcoded discussion object
      // In a real implementation, we would have an endpoint to get discussion details
      setDiscussion({
        id: discussionId!,
        title: "Discussion", 
        description: "This is a discussion",
        workspace_id: localStorage.getItem('currentWorkspaceId') || '' // Use stored workspace ID
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch discussion data');
    } finally {
      setIsLoading(false);
    }
  };

  

  const handleSendMessage = async (content: string) => {
    try {
      await discussionApi.postMessage(discussionId!, content);
      fetchDiscussionData(); // Refresh messages
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }
  console.log('Rendering DecisionProcess with discussionId:', discussionId);
  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {discussion?.title || 'Discussion'}
                </h1>
                <p className="mt-1 text-sm text-gray-500">{discussion?.description}</p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
                </button>
                <button
                  onClick={() => setShowDecision(!showDecision)}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {showDecision ? 'Hide Decision Process' : 'Show Decision Process'}
                </button>
                <Link
                  to={`/workspaces/${discussion?.workspace_id}`}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  Back to Workspace
                </Link>
              </div>
            </div>
          </div>

          {/* Decision Process Section */}
          {showDecision && (
            <div className="mb-8">
              
              <DecisionProcess discussionId={discussionId!} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`${showAnalysis ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Messages</h2>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {messages.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No messages yet. Start the conversation!</p>
                    ) : (
                      messages.map((message) => (
                        <MessageItem key={message.id} message={message} />
                      ))
                    )}
                  </div>
                  <div className="mt-6">
                    <MessageInput onSendMessage={handleSendMessage} />
                  </div>
                </div>
              </div>
            </div>

            {showAnalysis && (
              <div className="lg:col-span-1">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Discussion Analysis</h2>
                    <div className="space-y-6">
                      <BiasDetectionPanel discussionId={discussionId!} />
                      <PerspectiveMap discussionId={discussionId!} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discussion;