"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { 
  CheckCircleIcon, 
  CircleIcon, 
  ClockIcon, 
  UserIcon, 
  MessageSquareIcon,
  AlertCircleIcon,
  ActivityIcon
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

type AgentStatus = "available" | "busy" | "not_available";

export const AgentDashboardView = () => {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [isUpdating, setIsUpdating] = useState(false);

  // Get current agent status
  const agentStatus = useQuery(
    api.system.agentStatus.getAgentStatus,
    user && organization ? {
      organizationId: organization.id,
      agentId: user.id,
    } : "skip"
  );

  // Get agent workload
  const agentWorkload = useQuery(
    api.system.agentStatus.getAgentWorkload,
    user && organization ? {
      organizationId: organization.id,
      agentId: user.id,
    } : "skip"
  );

  // Update agent status mutation
  const updateAgentStatus = useMutation(api.system.agentStatus.updateAgentStatus);

  const handleStatusChange = async (newStatus: AgentStatus) => {
    if (!user || !organization) {
      toast.error("Please sign in to update status");
      return;
    }

    setIsUpdating(true);
    try {
      await updateAgentStatus({
        organizationId: organization.id,
        agentId: user.id,
        status: newStatus,
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusInfo = (status: AgentStatus) => {
    switch (status) {
      case "available":
        return {
          label: "Available",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircleIcon,
          description: "Ready to help customers"
        };
      case "busy":
        return {
          label: "Busy",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
          icon: ClockIcon,
          description: "Currently handling requests"
        };
      case "not_available":
        return {
          label: "Not Available",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: CircleIcon,
          description: "Away or offline"
        };
      default:
        return {
          label: "Unknown",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: CircleIcon,
          description: "Status unknown"
        };
    }
  };

  if (!user || !organization) {
    return (
      <div className="bg-muted p-8">
        <div className="container mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Please sign in to access the agent dashboard</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusInfo = agentStatus ? getStatusInfo(agentStatus.status) : null;
  const StatusIcon = statusInfo?.icon || CircleIcon;

  return (
    <div className="bg-muted p-8">
      <div className="container mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl md:text-4xl">Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your availability and monitor your workload
          </p>
        </div>

        <div className="space-y-6">
          {/* Agent Profile & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <UserIcon className="h-5 w-5" />
                Agent Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {user.fullName || user.emailAddresses[0]?.emailAddress || "Agent"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Support Agent • {organization.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {statusInfo && (
                    <Badge variant="outline" className={statusInfo.color}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ActivityIcon className="h-5 w-5" />
                Status Management
              </CardTitle>
              <CardDescription>
                Update your availability status to manage customer expectations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current Status</label>
                <Select
                  value={agentStatus?.status || "not_available"}
                  onValueChange={handleStatusChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="not_available">Not Available</SelectItem>
                  </SelectContent>
                </Select>
                {statusInfo && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {statusInfo.description}
                  </p>
                )}
              </div>
              
              {agentStatus?.lastStatusUpdate && (
                <div>
                  <label className="text-sm font-medium">Last Updated</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(agentStatus.lastStatusUpdate), { addSuffix: true })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workload Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MessageSquareIcon className="h-5 w-5" />
                Workload Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agentWorkload ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-blue-600">
                      {agentWorkload.totalAssigned || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Assigned</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-orange-600">
                      {agentWorkload.escalatedCount || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Escalated</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-green-600">
                      {agentWorkload.canTakeMore ? "Yes" : "No"}
                    </p>
                    <p className="text-sm text-muted-foreground">Can Take More</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Loading workload data...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleStatusChange("available")}
                disabled={isUpdating || agentStatus?.status === "available"}
              >
                <CheckCircleIcon className="mr-2 h-4 w-4" />
                Set Available
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleStatusChange("busy")}
                disabled={isUpdating || agentStatus?.status === "busy"}
              >
                <ClockIcon className="mr-2 h-4 w-4" />
                Set Busy
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleStatusChange("not_available")}
                disabled={isUpdating || agentStatus?.status === "not_available"}
              >
                <CircleIcon className="mr-2 h-4 w-4" />
                Set Not Available
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};