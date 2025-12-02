"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeftIcon, UserIcon, MessageSquareIcon, CheckIcon, MonitorIcon, GlobeIcon, ClockIcon, MailIcon, MapPinIcon, SmartphoneIcon, ScreenShareIcon } from "lucide-react";
import Link from "next/link";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";

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

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Conversation Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">ID</label>
                <p className="font-mono text-sm bg-muted p-2 rounded">{conversation._id}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="capitalize">{conversation.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Created</label>
                <p>{formatDistanceToNow(new Date(conversation._creationTime), { addSuffix: true })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-4">
          <Button asChild>
            <Link href={`/dashboard/conversations/${conversationId}`}>
              <MessageSquareIcon className="mr-2 h-4 w-4" />
              Open Chat
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};