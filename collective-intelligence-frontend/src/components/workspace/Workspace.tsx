import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { workspaceApi, discussionApi } from '../../services/api';
import Navbar from '../layout/Navbar';
import axios from 'axios';

interface Workspace {
  id: string;
  name: string;
  description: string;
}

interface Discussion {
  id: string;
  title: string;
  description: string;
  created_at: string;
  created_by: string;
}

const Workspace: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionDescription, setNewDiscussionDescription] = useState('');

  useEffect(() => {
    if (workspaceId) {
      // Store the current workspace ID in localStorage
      localStorage.setItem('currentWorkspaceId', workspaceId);
      fetchWorkspaceData();
    }
  }, [workspaceId]);

  // const fetchWorkspaceData = async () => {
  //   setIsLoading(true);
  //   try {
  //     const workspaceResponse = await workspaceApi.getWorkspace(workspaceId!);
  //     setWorkspace(workspaceResponse.data);

  //     const discussionsResponse = await discussionApi.getDiscussions(workspaceId!);
  //     setDiscussions(discussionsResponse.data.discussions);
  //   } catch (err: any) {
  //     setError(err.response?.data?.message || 'Failed to fetch workspace data');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await discussionApi.createDiscussion(
        workspaceId!,
        newDiscussionTitle,
        newDiscussionDescription
      );
      setShowCreateModal(false);
      setNewDiscussionTitle('');
      setNewDiscussionDescription('');
      fetchWorkspaceData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create discussion');
    }
  };

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  
// Update fetchMembers
const fetchMembers = async () => {
  try {
    const response = await workspaceApi.getWorkspaceMembers(workspaceId!);
    setMembers(response.data.members || []);
  } catch (error: any) {
    console.error('Error fetching members:', error);
  }
};

  // Call fetchMembers in fetchWorkspaceData
  const fetchWorkspaceData = async () => {
    setIsLoading(true);
    try {
      const workspaceResponse = await workspaceApi.getWorkspace(workspaceId!);
      setWorkspace(workspaceResponse.data);
  
      const discussionsResponse = await discussionApi.getDiscussions(workspaceId!);
      setDiscussions(discussionsResponse.data.discussions);
      
      // Fetch workspace members
      await fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch workspace data');
    } finally {
      setIsLoading(false);
    }
  };
  
// Update handleAddMember
const handleAddMember = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await workspaceApi.addWorkspaceMember(workspaceId!, newMemberUsername);
    setShowAddMemberModal(false);
    setNewMemberUsername('');
    fetchMembers(); // Refresh members list
  } catch (error: any) {
    console.error('Error adding member:', error);
    setError(error.response?.data?.message || 'Failed to add member');
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

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{workspace?.name}</h1>
                <p className="mt-1 text-sm text-gray-500">{workspace?.description}</p>
              </div>
              <Link
                to="/"
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                Back to Workspaces
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-900">Discussions</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start Discussion
              </button>
            </div>

            {discussions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">No discussions have been started in this workspace.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Start the First Discussion
                </button>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {discussions.map((discussion) => (
                    <li key={discussion.id}>
                      <Link
                        to={`/discussions/${discussion.id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {discussion.title}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Active
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {discussion.description}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                Created on{' '}
                                {new Date(discussion.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Discussion Modal */}
      {showCreateModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateDiscussion}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Start New Discussion
                      </h3>
                      <div className="mt-4">
                        <div className="mb-4">
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newDiscussionTitle}
                            onChange={(e) => setNewDiscussionTitle(e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newDiscussionDescription}
                            onChange={(e) => setNewDiscussionDescription(e.target.value)}
                          ></textarea>
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
                    Create
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

  <div className="border-t border-gray-200 pt-6 mt-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-medium text-gray-900">Members</h2>
      <button
        onClick={() => setShowAddMemberModal(true)}
        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Add Member
      </button>
    </div>
  
    {members.length === 0 ? (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No other members in this workspace.</p>
      </div>
    ) : (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {members.map((member) => (
            <li key={member.user_id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    {member.username}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {member.role}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {member.email}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      Joined on{' '}
                      {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
  
  {/* Add Member Modal */}
  {showAddMemberModal && (
  <div className="fixed z-10 inset-0 overflow-y-auto">
    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowAddMemberModal(false)}>
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
           onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleAddMember}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Add Member to Workspace
                </h3>
                <div className="mt-4">
                  <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newMemberUsername}
                      onChange={(e) => setNewMemberUsername(e.target.value)}
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
              Add Member
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => setShowAddMemberModal(false)}
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

export default Workspace;
