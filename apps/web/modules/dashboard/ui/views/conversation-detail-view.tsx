"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeftIcon, UserIcon, MessageSquareIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { formatDistanceToNow } from "date-fns";

interface ConversationDetailViewProps {
  conversationId: string;
}

export const ConversationDetailView = ({ conversationId }: ConversationDetailViewProps) => {
  // Validate the conversationId format
  const isValidId = conversationId && conversationId.length > 0;
  
  const conversation = useQuery(
    api.private.conversations.getOne,
    isValidId ? { conversationId: conversationId as Id<"conversations"> } : "skip"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-x-4">
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link href="/dashboard/conversations">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Conversation Details
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Client information and system diagnostics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-x-3">
            <ConversationStatusIcon status={conversation.status} />
            <Badge 
              variant={conversation.status === 'resolved' ? 'default' : 'secondary'}
              className="capitalize px-3 py-1"
            >
              {conversation.status}
            </Badge>
          </div>
        </div>

        {/* Client & System Info */}
        <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1">
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-x-3 text-lg">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {conversation.contactSession && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Full Name
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {conversation.contactSession.name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email Address
                    </label>
                    <p className="text-sm text-gray-700 dark:text-gray-300 break-all">
                      {conversation.contactSession.metadata.referrer || 'Direct'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Current URL
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg border break-all">
                      {conversation.contactSession.metadata.currentUrl || 'Not available'}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-x-3 text-lg">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <MessageSquareIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                Conversation Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Conversation ID
                </label>
                <p className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded-lg border break-all">
                  {conversation._id}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thread ID
                </label>
                <p className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded-lg border break-all">
                  {conversation.threadId}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Organization ID
                </label>
                <p className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded-lg border break-all">
                  {conversation.organizationId}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </label>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {formatDistanceToNow(new Date(conversation._creationTime), { addSuffix: true })}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(conversation._creationTime).toLocaleString()}
                </p>
              </div>
              
              {conversation.queuePosition && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Queue Position
                  </label>
                  <div className="inline-flex items-center px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-sm font-semibold">
                    #{conversation.queuePosition}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assigned Agent Info */}
        {conversation.assignedAgentId && (
          <div className="mt-6">
            <Card className="shadow-lg border-0 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-x-3 text-lg">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <UserIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Assigned Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Agent ID
                  </label>
                  <p className="font-mono text-sm bg-white dark:bg-gray-800 p-3 rounded-lg border break-all">
                    {conversation.assignedAgentId}
                  </p>
                </div>
                {conversation.escalatedAt && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Escalated At
                    </label>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {formatDistanceToNow(new Date(conversation.escalatedAt), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(conversation.escalatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <Link href={`/dashboard/conversations/${conversationId}`}>
              <MessageSquareIcon className="mr-2 h-5 w-5" />
              {conversation.status === 'resolved' ? 'View Chat History' : 'Open Chat & Assist Client'}
            </Link>
          </Button>
          {conversation.status !== 'resolved' && (
            <Button variant="outline" size="lg" className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800">
              <CheckIcon className="mr-2 h-4 w-4" />
              Mark as Resolved
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};