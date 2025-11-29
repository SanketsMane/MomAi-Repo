"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useApprovalStatus } from "@/hooks/use-approval-status";
import { useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { AlertTriangle, Clock, XCircle, Loader2 } from "lucide-react";

interface ApprovalGuardProps {
  children: React.ReactNode;
}

export const ApprovalGuard = ({ children }: ApprovalGuardProps) => {
  const { user, isLoaded } = useUser();
  const { isLoading, isApproved, approvalStatus, message } = useApprovalStatus();
  const registerUser = useMutation(api.public.userApprovals.registerUser);

  // Auto-register user when they first sign in
  useEffect(() => {
    if (isLoaded && user && approvalStatus === null) {
      // User not in approval system, register them
      registerUser({
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || user.firstName || "Unknown User",
        phone: user.phoneNumbers?.[0]?.phoneNumber,
      }).catch(console.error);
    }
  }, [isLoaded, user, approvalStatus, registerUser]);

  // Show loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show approval status messages for non-approved users
  if (!isApproved && message) {
    const getIcon = () => {
      switch (approvalStatus) {
        case "Pending":
          return <Clock className="w-12 h-12 text-yellow-500" />;
        case "Rejected":
          return <XCircle className="w-12 h-12 text-red-500" />;
        default:
          return <AlertTriangle className="w-12 h-12 text-orange-500" />;
      }
    };

    const getTitle = () => {
      switch (approvalStatus) {
        case "Pending":
          return "Account Under Review";
        case "Rejected":
          return "Account Rejected";
        default:
          return "Account Access Restricted";
      }
    };

    const getColor = () => {
      switch (approvalStatus) {
        case "Pending":
          return "border-yellow-200 bg-yellow-50";
        case "Rejected":
          return "border-red-200 bg-red-50";
        default:
          return "border-orange-200 bg-orange-50";
      }
    };

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className={`max-w-md w-full ${getColor()}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              {getTitle()}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                You are signed in as: <strong>{user?.primaryEmailAddress?.emailAddress}</strong>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <SignOutButton>
                <Button variant="outline" className="w-full">
                  Sign Out
                </Button>
              </SignOutButton>
              {approvalStatus === "Rejected" && (
                <Button 
                  variant="link" 
                  className="w-full text-sm"
                  onClick={() => window.open("mailto:momai252025@gmail.com", "_blank")}
                >
                  Contact Support
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is approved, show the app
  return <>{children}</>;
};