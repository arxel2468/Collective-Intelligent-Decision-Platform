// src/components/decision/DecisionStage.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface DecisionStageProps {
  stage: {
    id: string;
    name: string;
    description: string;
    order_index: number;
    status: string;
  };
  processId: string;
}

const DecisionStage: React.FC<DecisionStageProps> = ({ stage, processId }) => {
  const [status, setStatus] = useState(stage.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      // This endpoint doesn't exist yet, but would be implemented in the backend
      await axios.patch(`/api/decision-stages/${stage.id}`, {
        status: newStatus
      });
      setStatus(newStatus);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update stage status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-md p-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">{stage.order_index + 1}. {stage.name}</h4>
          <p className="text-sm text-gray-500 mt-1">{stage.description}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          status === 'completed' 
            ? 'bg-green-100 text-green-800' 
            : status === 'in_progress'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
        }`}>
          {status === 'completed' 
            ? 'Completed' 
            : status === 'in_progress' 
              ? 'In Progress' 
              : 'Pending'}
        </span>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-500">{error}</div>
      )}
      
      <div className="mt-3 flex space-x-2">
        {status !== 'in_progress' && status !== 'completed' && (
          <button
            onClick={() => handleUpdateStatus('in_progress')}
            disabled={isUpdating}
            className="px-3 py-1 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Start Stage
          </button>
        )}
        
        {status === 'in_progress' && (
          <button
            onClick={() => handleUpdateStatus('completed')}
            disabled={isUpdating}
            className="px-3 py-1 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            Complete Stage
          </button>
        )}
        
        {status === 'completed' && (
          <button
            onClick={() => handleUpdateStatus('in_progress')}
            disabled={isUpdating}
            className="px-3 py-1 text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
          >
            Reopen Stage
          </button>
        )}
      </div>
    </div>
  );
};

export default DecisionStage;