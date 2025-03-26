// src/components/decision/DecisionDocument.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DecisionDocumentProps {
  processId: string;
}

interface Document {
  id: string;
  title: string;
  content: string;
  version: number;
  updated_at: string;
}

const DecisionDocument: React.FC<DecisionDocumentProps> = ({ processId }) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [processId]);

  const fetchDocument = async () => {
    setIsLoading(true);
    try {
      // This endpoint doesn't exist yet, but would be implemented in the backend
      const response = await axios.get(`/api/decision-processes/${processId}/document`);
      if (response.data.document) {
        setDocument(response.data.document);
        setTitle(response.data.document.title);
        setContent(response.data.document.content);
      }
    } catch (err: any) {
      // If 404, it means no document exists yet
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || 'Failed to fetch document');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    setIsSaving(true);
    try {
      // This endpoint doesn't exist yet, but would be implemented in the backend
      const response = await axios.post(`/api/decision-processes/${processId}/document`, {
        title,
        content
      });
      setDocument(response.data.document);
      setEditMode(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateDocument = async () => {
    setIsSaving(true);
    try {
      // This endpoint doesn't exist yet, but would be implemented in the backend
      const response = await axios.put(`/api/decision-documents/${document!.id}`, {
        title,
        content
      });
      setDocument(response.data.document);
      setEditMode(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update document');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
        <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
    );
  }

  if (!document && !editMode) {
    return (
      <div>
        <h3 className="text-md font-medium text-gray-700 mb-2">Decision Document</h3>
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No decision document has been created yet.</p>
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Document
          </button>
        </div>
      </div>
    );
  }

  if (editMode) {
    return (
      <div>
        <h3 className="text-md font-medium text-gray-700 mb-2">
          {document ? 'Edit Decision Document' : 'Create Decision Document'}
        </h3>
        
        {error && (
          <div className="mb-4 text-sm text-red-500">{error}</div>
        )}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              rows={8}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                if (document) {
                  setTitle(document.title);
                  setContent(document.content);
                }
              }}
              className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={document ? handleUpdateDocument : handleCreateDocument}
              disabled={isSaving || !title.trim()}
              className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : document ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-medium text-gray-700">Decision Document</h3>
        <button
          onClick={() => setEditMode(true)}
          className="px-2 py-1 text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Edit
        </button>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-medium text-gray-900">{document?.title}</h4>
          <span className="text-xs text-gray-500">
            Version {document?.version} | Last updated {new Date(document?.updated_at || '').toLocaleString()}
          </span>
        </div>
        <div className="prose prose-sm max-w-none text-gray-700">
          {document?.content.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DecisionDocument;