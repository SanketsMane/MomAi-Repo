"use client";

import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeftIcon, MessageSquareIcon, UserIcon, BotIcon } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";

interface ConversationMessagesViewProps {
  conversationId: string;
}

interface MessageItemProps {
  message: any; // Complex Convex message structure
}

const MessageItem = ({ message }: MessageItemProps) => {
  // Handle the nested message structure from Convex agent messages
  const messageObj = message.message || message;
  const isUser = messageObj.role === 'user';
  const content = typeof messageObj.content === 'string' 
    ? messageObj.content 
    : Array.isArray(messageObj.content) 
      ? messageObj.content.map((c: any) => c.text || c.content || '').join('') 
      : message.text || '';
  
  return (
    <div className={`flex gap-x-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-primary-foreground" />
          </div>
        ) : (
          <DicebearAvatar seed="assistant" size={32} imageUrl="/logo.svg" />
        )}
      </div>
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-lg px-4 py-2 ${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-foreground'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(message._creationTime), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};

export const ConversationMessagesView = ({ conversationId }: ConversationMessagesViewProps) => {
  // Validate the conversationId format
  const isValidId = conversationId && conversationId.length > 0;
  
  const conversation = useQuery(
    api.private.conversations.getOne,
    isValidId ? { conversationId: conversationId as Id<"conversations"> } : "skip"
  );

  const messagesQuery = usePaginatedQuery(
    api.private.messages.getMany,
    conversation?.threadId ? { threadId: conversation.threadId } : "skip",
    { initialNumItems: 20 }
  );

  if (!isValidId) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-y-4">
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

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center gap-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/conversations/${conversationId}`}>
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-x-2">
            <MessageSquareIcon className="h-5 w-5" />
            <h1 className="text-xl font-semibold">Conversation Messages</h1>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MessageSquareIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p className="text-muted-foreground">This conversation doesn't have any messages.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message) => (
              <MessageItem key={message._id} message={message} />
            ))}
            
            {messagesQuery.status === "CanLoadMore" && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => messagesQuery.loadMore(10)}
                  disabled={messagesQuery.isLoading}
                >
                  Load More Messages
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};