"use client";

import { Button } from "@workspace/ui/components/button";
import { api } from "@workspace/backend/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  MessageSquare,
  Timer
} from "lucide-react";
import { useState } from "react";
import { AgentStatusBadge } from "./agent-status-badge";

type AgentStatus = "available" | "busy" | "not_available";

interface AgentStatusControlsProps {
  currentStatus: AgentStatus;
  conversationCount: number;
  queueSize: number;
  isAutoDetectedBusy: boolean;
  onStatusChange: (status: AgentStatus) => void;
  isLoading?: boolean;
}

export const AgentStatusControls = ({
  currentStatus,
  conversationCount,
  queueSize,
  isAutoDetectedBusy,
  onStatusChange,
  isLoading = false,
}: AgentStatusControlsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: AgentStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "busy":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "not_available":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const isButtonDisabled = isLoading || isUpdating;

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(currentStatus)}
            Agent Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Status:</span>
            <AgentStatusBadge 
              status={currentStatus} 
              conversationCount={conversationCount}
            />
          </div>
          
          {isAutoDetectedBusy && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Auto-detected as Busy</p>
                <p>You have {conversationCount} or more active conversations. Status was automatically updated to prevent overload.</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Status Control Buttons */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Change Status:</h4>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant={currentStatus === "available" ? "default" : "outline"}
                size="sm"
                disabled={isButtonDisabled}
                onClick={() => handleStatusChange("available")}
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Available
                {currentStatus === "available" && (
                  <Badge variant="secondary" className="ml-auto">Current</Badge>
                )}
              </Button>

              <Button
                variant={currentStatus === "not_available" ? "default" : "outline"}
                size="sm"
                disabled={isButtonDisabled}
                onClick={() => handleStatusChange("not_available")}
                className="justify-start"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Not Available
                {currentStatus === "not_available" && (
                  <Badge variant="secondary" className="ml-auto">Current</Badge>
                )}
              </Button>

              <Button
                variant={currentStatus === "busy" ? "default" : "outline"}
                size="sm"
                disabled={isButtonDisabled || conversationCount < 2}
                onClick={() => handleStatusChange("busy")}
                className="justify-start"
              >
                <Clock className="h-4 w-4 mr-2" />
                Busy (Manual Override)
                {currentStatus === "busy" && (
                  <Badge variant="secondary" className="ml-auto">Current</Badge>
                )}
              </Button>
            </div>
            
            {conversationCount < 2 && (
              <p className="text-xs text-muted-foreground">
                * Busy status is automatically enabled with 2+ active conversations
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workload Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Workload Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-md">
              <div className="text-2xl font-bold text-blue-600">{conversationCount}</div>
              <div className="text-sm text-blue-800">Active Conversations</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-md">
              <div className="text-2xl font-bold text-orange-600">{queueSize}</div>
              <div className="text-sm text-orange-800">In Queue</div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Capacity:</span>
              <span className="font-medium">
                {conversationCount}/2 conversations
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min((conversationCount / 2) * 100, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Information */}
      {queueSize > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Queue Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Customers waiting:</span>
                <Badge variant="outline">{queueSize} customers</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Est. total wait time:</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {queueSize * 5} minutes
                </Badge>
              </div>
              
              {currentStatus === "available" && conversationCount < 2 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    💡 You can take the next customer from the queue when ready.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Status Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
            <div>
              <span className="font-medium">Available:</span> Ready to take new escalated conversations
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-3 w-3 text-yellow-500 mt-0.5" />
            <div>
              <span className="font-medium">Busy:</span> At capacity (2+ conversations) or manually set
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-3 w-3 text-red-500 mt-0.5" />
            <div>
              <span className="font-medium">Not Available:</span> Cannot receive any escalated conversations
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};