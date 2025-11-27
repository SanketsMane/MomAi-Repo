"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { MessageSquareIcon, UserIcon, ClockIcon } from "lucide-react";
import Link from "next/link";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

export const ConversationsView = () => {
  const conversations = usePaginatedQuery(
    api.private.conversations.getMany,
    {},
    { initialNumItems: 20 }
  );

  if (conversations.status === "LoadingFirstPage") {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-y-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading conversations...</p>
      </div>
    );
  }

  const conversationsList = conversations.results || [];

  if (conversationsList.length === 0) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-y-4 bg-muted p-6">
        <Image alt="Logo" height={80} width={80} src="/logo.svg" />
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No conversations yet</h2>
          <p className="text-muted-foreground mb-6">
            Conversations will appear here when users start chatting with your AI assistant.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>💬 Users can start conversations through your widget</p>
            <p>🤖 AI responses will be handled automatically</p>
            <p>👥 Escalated conversations will appear here for agent handling</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <MessageSquareIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Conversations</h1>
        </div>
        <Badge variant="secondary">
          {conversationsList.length} conversation{conversationsList.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-4">
        {conversationsList.map((conversation) => (
          <Card key={conversation._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-x-2">
                  <ConversationStatusIcon status={conversation.status} />
                  <span className="font-mono text-sm">#{conversation._id.slice(-8)}</span>
                </CardTitle>
                <div className="flex items-center gap-x-2">
                  <Badge variant={conversation.status === 'resolved' ? 'default' : 'secondary'}>
                    {conversation.status}
                  </Badge>
                  <div className="flex items-center gap-x-1 text-xs text-muted-foreground">
                    <ClockIcon className="h-3 w-3" />
                    {formatDistanceToNow(new Date(conversation._creationTime), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                  <span>Contact: {conversation.contactSessionId.slice(-8)}</span>
                </div>
                
                {conversation.assignedAgentId && (
                  <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
                    <UserIcon className="h-4 w-4" />
                    <span>Agent: {conversation.assignedAgentId}</span>
                  </div>
                )}

                <div className="flex gap-x-2 pt-2">
                  <Button asChild size="sm">
                    <Link href={`/dashboard/conversations/${conversation._id}/details`}>
                      View Details
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/conversations/${conversation._id}`}>
                      Open Chat
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {conversations.status === "CanLoadMore" && (
          <div className="text-center pt-4">
            <Button 
              variant="outline" 
              onClick={() => conversations.loadMore(10)}
              disabled={conversations.isLoading}
            >
              Load More Conversations
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
