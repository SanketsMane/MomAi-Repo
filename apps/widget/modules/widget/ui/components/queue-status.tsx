"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Clock, Users, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface QueueStatusProps {
  conversationId: string;
  contactSessionId: string;
}

export const QueueStatus = ({ conversationId, contactSessionId }: QueueStatusProps) => {
  const [refreshInterval, setRefreshInterval] = useState<number | null>(5000);

  // Get queue status for this conversation
  const queueStatus = useQuery(
    api.system.escalationQueue.getQueueStatus,
    conversationId && contactSessionId ? {
      conversationId: conversationId as any,
      contactSessionId: contactSessionId as any,
    } : "skip"
  );

  // Auto-refresh every 5 seconds while in queue
  useEffect(() => {
    if (!queueStatus?.inQueue) {
      setRefreshInterval(null);
      return;
    }

    const interval = setInterval(() => {
      // Trigger re-query by updating refresh interval
      setRefreshInterval(Date.now());
    }, 5000);

    return () => clearInterval(interval);
  }, [queueStatus?.inQueue]);

  if (!queueStatus?.inQueue) {
    return null;
  }

  const { position, estimatedWaitTime, queuedAt } = queueStatus;
  const waitedMinutes = queuedAt ? Math.floor((Date.now() - queuedAt) / 60000) : 0;
  const remainingWaitMinutes = Math.max(0, (estimatedWaitTime || 0) - waitedMinutes);

  return (
    <div className="mx-4 mb-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mx-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-[#0A2558] rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-[#0A2558]">
                You&apos;re in the queue
              </h4>
              <div className="flex items-center gap-1 text-xs text-blue-700">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                Live Updates
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-md p-3 text-center">
                  <div className="text-lg font-bold text-orange-600">#{position}</div>
                  <div className="text-xs text-orange-800">Your Position</div>
                </div>
                <div className="bg-white rounded-md p-3 text-center">
                  <div className="text-lg font-bold text-orange-600">{remainingWaitMinutes}m</div>
                  <div className="text-xs text-orange-800">Est. Wait Time</div>
                </div>
              </div>
              
              <div className="bg-white rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-orange-900">Queue Progress</span>
                  <span className="text-xs text-orange-700">
                    {waitedMinutes}m waited
                  </span>
                </div>
                
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${Math.min((waitedMinutes / (estimatedWaitTime || 1)) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-orange-800">
                <Users className="w-3 h-3" />
                <span>
                  All agents are currently busy. We&apos;ll connect you shortly.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status indicator for escalated conversations
interface EscalationStatusProps {
  conversationStatus: "unresolved" | "escalated" | "resolved" | "queued";
}

export const EscalationStatus = ({ conversationStatus }: EscalationStatusProps) => {
  if (conversationStatus === "escalated") {
    return (
      <div className="mx-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Connected to live agent
              </p>
              <p className="text-xs text-green-700">
                You&apos;re now chatting with a human support agent
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (conversationStatus === "resolved") {
    return (
      <div className="mx-4 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Conversation resolved
              </p>
              <p className="text-xs text-blue-700">
                This conversation has been marked as resolved
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};