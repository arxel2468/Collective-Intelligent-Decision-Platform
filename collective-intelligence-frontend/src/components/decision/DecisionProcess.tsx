// DecisionProcess.tsx (fixed version)
import React, { useState, useEffect } from 'react';
import { decisionApi } from '../../services/api';
import axios from 'axios';

interface DecisionProcessProps {
  discussionId: string;
}

interface Process {
  id: string;
  title: string;
  status: string;
  started_at: string;
  completed_at: string | null;
}

interface Stage {
  id: string;
  name: string;
  description: string;
  order_index: number;
  status: string;
}

const DecisionProcess: React.FC<DecisionProcessProps> = ({ discussionId }) => {
  const [process, setProcess] = useState<Process | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [processTitle, setProcessTitle] = useState('');

  // API testing effects...
  useEffect(() => {
    // Test the API directly
    const testApi = async () => {
      try {
        console.log('Testing API connectivity...');
        const testResponse = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('API test response:', await testResponse.json());
      } catch (error) {
        console.error('API test error:', error);
      }
    };
    
    testApi();
  }, []);

  useEffect(() => {
    // Test the token
    const testToken = async () => {
      const token = localStorage.getItem('token');
      console.log("Testing token:", token);
      
      try {
        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          console.log('Token is valid:', await response.json());
        } else {
          console.error('Token validation failed:', await response.text());
        }
      } catch (error) {
        console.error('Token test error:', error);
      }
    };
    
    testToken();
  }, []);

  useEffect(() => {
    fetchDecisionProcess();
  }, [discussionId]);

  const fetchDecisionProcess = async () => {
    // Fetch decision process implementation...
    setIsLoading(true);
    try {
      console.log('Fetching decision process for discussion:', discussionId);
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      console.log('Using token for fetch:', token);
      
      // Use the fetch API directly
      const response = await fetch(`/api/discussions/${discussionId}/decision-process`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Decision process response:', data);
        
        if (data.process) {
          setProcess(data.process);
          setStages(data.stages || []);
        }
      } else if (response.status === 404) {
        // 404 is expected for a new discussion without a process
        console.log('No decision process found (expected for new discussions)');
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch decision process: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      console.log('Error fetching decision process:', error);
      setError(error.message || 'Failed to fetch decision process');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProcess = async (e: React.FormEvent) => {
    // Create decision process implementation...
    e.preventDefault();
    console.log('Form submitted with process title:', processTitle);
    
    try {
      setIsLoading(true);
      console.log('Creating decision process with direct fetch API...');
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      console.log('Using token:', token);
      
      // Use the fetch API directly
      const response = await fetch(`/api/discussions/${discussionId}/decision-process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: processTitle })
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Decision process created successfully:', data);
        setProcess(data.process);
        setStages(data.stages || []);
        setShowCreateModal(false);
        setProcessTitle('');
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to create decision process: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error creating decision process:', error);
      setError(error.message || 'Failed to create decision process');
    } finally {
      setIsLoading(false);
    }
  };

  console.log('Decision process state:', { process, stages, isLoading, error, showCreateModal });
  
  if (showCreateModal) {
    console.log('Rendering create process modal');
  }

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
        <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
    );
  }

  // Render the main component
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {!process ? (
        // No process exists yet
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Decision Process</h2>
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No decision process has been started for this discussion.</p>
            <button
              onClick={() => {
                console.log('Start Decision Process button clicked');
                console.log('Current state:', { showCreateModal, processTitle });
                setShowCreateModal(true);
                console.log('State after update:', { showCreateModal: true, processTitle });
              }}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Start Decision Process
            </button>
          </div>
        </div>
      ) : (
        // Process exists, show process details
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">{process.title}</h2>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              process.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {process.status === 'completed' ? 'Completed' : 'In Progress'}
            </span>
          </div>
          
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-2">Process Stages</h3>
            <div className="space-y-4">
              {stages.map((stage) => (
                <div key={stage.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{stage.order_index + 1}. {stage.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{stage.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      stage.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : stage.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {stage.status === 'completed' 
                        ? 'Completed' 
                        : stage.status === 'in_progress' 
                          ? 'In Progress' 
                          : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Create Process Modal - Always render this at the end, outside of conditional returns */}
      {showCreateModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateProcess}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Start Decision Process
                      </h3>
                      <div className="mt-4">
                        <div className="mb-4">
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Process Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={processTitle}
                            onChange={(e) => setProcessTitle(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Start Process
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionProcess;