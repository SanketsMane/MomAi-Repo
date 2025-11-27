"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { 
  ArrowLeftIcon, 
  SendIcon, 
  UserIcon, 
  CheckCircleIcon,
  AlertCircleIcon,
  MessageSquareIcon
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { useUser } from "@clerk/nextjs";

interface AgentChatInterfaceProps {
  conversationId: string;
}

interface MessageItemProps {
  message: any; // Using any for complex Convex message structure
  isAgentMessage?: boolean;
}

const MessageItem = ({ message, isAgentMessage = false }: MessageItemProps) => {
  // Handle the nested message structure from Convex agent messages
  const messageObj = message.message || message;
  const isUser = messageObj.role === 'user';
  const content = typeof messageObj.content === 'string' 
    ? messageObj.content 
    : Array.isArray(messageObj.content) 
      ? messageObj.content.map((c: any) => c.text || c.content || '').join('') 
      : message.text || '';
  
  return (
    <div className={`flex gap-x-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
        ) : isAgentMessage ? (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
        ) : (
          <DicebearAvatar seed="assistant" size={32} imageUrl="/logo.svg" />
        )}
      </div>
      <div className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-x-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground">
            {isUser ? 'Client' : isAgentMessage ? 'Agent' : 'AI Assistant'}
          </span>
          {isAgentMessage && (
            <Badge variant="outline" className="text-xs">
              Human Agent
            </Badge>
          )}
        </div>
        <div className={`rounded-lg px-4 py-3 ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : isAgentMessage
            ? 'bg-green-50 border-2 border-green-200 text-green-900'
            : 'bg-muted text-foreground'
        }`}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(message._creationTime), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};

export const AgentChatInterface = ({ conversationId }: AgentChatInterfaceProps) => {
  const { user } = useUser();
  const [messageText, setMessageText] = useState("");
  const [isAssigningToSelf, setIsAssigningToSelf] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValidId = conversationId && conversationId.length > 0;
  
  const conversation = useQuery(
    api.private.conversations.getOne,
    isValidId ? { conversationId: conversationId as Id<"conversations"> } : "skip"
  );

  const messagesQuery = usePaginatedQuery(
    api.private.messages.getMany,
    conversation?.threadId ? { threadId: conversation.threadId } : "skip",
    { initialNumItems: 50 }
  );

  const createMessage = useMutation(api.private.messages.create);
  const updateConversationStatus = useMutation(api.private.conversations.updateStatus);
  const assignAgent = useMutation(api.private.conversations.assignToAgent);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesQuery.results]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !conversation) return;

    try {
      await createMessage({
        prompt: messageText,
        conversationId: conversation._id
      });
      setMessageText("");
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleAssignToSelf = async () => {
    if (!conversation || !user?.id) return;
    
    setIsAssigningToSelf(true);
    try {
      await assignAgent({
        conversationId: conversation._id,
        agentId: user.id
      });
    } catch (error) {
      console.error('Failed to assign conversation:', error);
    } finally {
      setIsAssigningToSelf(false);
    }
  };

  const handleResolveConversation = async () => {
    if (!conversation) return;
    
    try {
      await updateConversationStatus({
        conversationId: conversation._id,
        status: "resolved"
      });
    } catch (error) {
      console.error('Failed to resolve conversation:', error);
    }
  };

  if (!isValidId) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-y-4">
        <AlertCircleIcon className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">Invalid Conversation ID</h1>
        <p className="text-muted-foreground">The conversation ID provided is not valid.</p>
        <Button asChild>
          <Link href="/dashboard/conversations">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Conversations
          </Link>
        </Button>
      </div>
    );
  }

  if (conversation === undefined) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-y-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }

  if (conversation === null) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-y-4">
        <AlertCircleIcon className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">Conversation Not Found</h1>
        <p className="text-muted-foreground">
          The conversation with ID <code className="bg-muted px-2 py-1 rounded">{conversationId}</code> could not be found.
        </p>
        <Button asChild>
          <Link href="/dashboard/conversations">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Conversations
          </Link>
        </Button>
      </div>
    );
  }

  const messages = messagesQuery.results || [];
  const isResolved = conversation.status === 'resolved';
  const isAssignedToMe = conversation.assignedAgentId === user?.id;
  const hasAssignedAgent = !!conversation.assignedAgentId;

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/conversations/${conversationId}`}>
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-x-3">
              <MessageSquareIcon className="h-5 w-5" />
              <div>
                <h1 className="text-xl font-semibold">Live Chat Session</h1>
                <p className="text-sm text-muted-foreground">
                  Conversation #{conversationId.slice(-8)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-x-3">
            <ConversationStatusIcon status={conversation.status} />
            <Badge variant={isResolved ? 'default' : 'secondary'}>
              {conversation.status}
            </Badge>
            
            {!isResolved && (
              <div className="flex gap-x-2">
                {!hasAssignedAgent && (
                  <Button 
                    onClick={handleAssignToSelf}
                    disabled={isAssigningToSelf}
                    size="sm"
                  >
                    {isAssigningToSelf ? 'Assigning...' : 'Take Conversation'}
                  </Button>
                )}
                
                {isAssignedToMe && (
                  <Button 
                    onClick={handleResolveConversation}
                    variant="outline"
                    size="sm"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Resolve
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {hasAssignedAgent && (
          <div className="mt-2 flex items-center gap-x-2 text-sm text-muted-foreground">
            <UserIcon className="h-4 w-4" />
            <span>
              {isAssignedToMe ? 'You are' : 'Agent is'} handling this conversation
              {conversation.assignedAgentId && ` (${conversation.assignedAgentId})`}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MessageSquareIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p className="text-muted-foreground">Start the conversation with your client.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <MessageItem 
                key={message._id} 
                message={message} 
                isAgentMessage={((message as any).message?.role || (message as any)?.role) === 'assistant' && conversation.assignedAgentId === user?.id}
              />
            ))}
            <div ref={messagesEndRef} />
            
            {messagesQuery.status === "CanLoadMore" && (
              <div className="text-center py-4">
                <Button 
                  variant="outline" 
                  onClick={() => messagesQuery.loadMore(20)}
                  disabled={messagesQuery.isLoading}
                >
                  Load Earlier Messages
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      {!isResolved ? (
        <div className="border-t bg-background p-4">
          {!isAssignedToMe && hasAssignedAgent ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-3">
                This conversation is assigned to another agent.
              </p>
              <Button onClick={handleAssignToSelf} disabled={isAssigningToSelf}>
                {isAssigningToSelf ? 'Taking over...' : 'Take Over Conversation'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex gap-x-2">
              <Input
                ref={inputRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={isAssignedToMe ? "Type your message to help the client..." : "Type a message to join this conversation..."}
                className="flex-1"
                disabled={messagesQuery.isLoading}
              />
              <Button 
                type="submit" 
                disabled={!messageText.trim() || messagesQuery.isLoading}
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      ) : (
        <div className="border-t bg-muted p-4 text-center">
          <p className="text-muted-foreground">
            <CheckCircleIcon className="inline h-4 w-4 mr-1" />
            This conversation has been resolved.
          </p>
        </div>
      )}
    </div>
  );
};