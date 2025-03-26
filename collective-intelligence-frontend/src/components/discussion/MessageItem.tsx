import React from 'react';

interface MessageProps {
  message: {
    id: string;
    content: string;
    user_id: string;
    username: string;
    created_at: string;
  };
}

const MessageItem: React.FC<MessageProps> = ({ message }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-start">
        <div className="font-medium text-gray-900">{message.username}</div>
        <div className="text-xs text-gray-500">
          {new Date(message.created_at).toLocaleString()}
        </div>
      </div>
      <div className="mt-2 text-gray-700">{message.content}</div>
    </div>
  );
};

export default MessageItem;
