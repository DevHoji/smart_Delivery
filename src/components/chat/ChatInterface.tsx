import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Message, User } from '@/types';
import { useSocket } from '@/lib/socket/useSocket';
import { formatDistanceToNow } from 'date-fns';

interface ChatInterfaceProps {
  deliveryId: string;
  currentUser: User;
  initialMessages?: Message[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  deliveryId,
  currentUser,
  initialMessages = [],
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set up socket connection and handlers
  const { isConnected, sendMessage } = useSocket(deliveryId, {
    onMessageReceived: (data) => {
      const newMsg: Message = {
        id: Date.now().toString(), // Temporary ID until we get the real one from the server
        content: data.content,
        senderId: data.senderId,
        deliveryId: data.deliveryId,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, newMsg]);
    },
  });

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Prepare new message
    const messageData = {
      content: newMessage,
      senderId: currentUser.id,
      deliveryId,
    };
    
    // Send via socket for real-time
    sendMessage(messageData);
    
    // Also save to database via API
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      
      if (response.ok) {
        const savedMessage = await response.json();
        // Update the temporary message with the saved one (which has a proper ID)
        setMessages((prev) => 
          prev.map((msg) => 
            (msg.id === messageData.id ? savedMessage : msg)
          )
        );
      }
    } catch (error) {
      console.error('Failed to save message:', error);
    }
    
    // Clear input
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-primary text-white px-4 py-3 font-medium">
        Chat
        <span className={`ml-2 h-2 w-2 rounded-full inline-block ${
          isConnected ? 'bg-green-400' : 'bg-red-400'
        }`}></span>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 max-w-[80%] ${
                message.senderId === currentUser.id
                  ? 'ml-auto bg-primary text-white'
                  : 'mr-auto bg-gray-100'
              } rounded-lg p-3`}
            >
              <div className="text-sm break-words">{message.content}</div>
              <div className="text-xs mt-1 opacity-70">
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="border-t p-3 flex items-center">
        <Input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 mr-2"
        />
        <Button type="submit" disabled={!isConnected}>
          Send
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;
