"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UseApprovalStatusReturn {
  isLoading: boolean;
  isApproved: boolean;
  approvalStatus: "Pending" | "Active" | "Rejected" | null;
  message: string | null;
  user: any;
}

export const useApprovalStatus = (): UseApprovalStatusReturn => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  // Get user approval status
  const approvalData = useQuery(
    api.public.userApprovals.getUserApprovalStatus,
    user ? { userId: user.id } : "skip"
  );

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Auto-register user if not in approval system
    if (isLoaded && user && approvalData === null) {
      // User not registered in approval system, register them
      // This will be handled by a mutation in the component that uses this hook
      return;
    }

    if (approvalData) {
      switch (approvalData.status) {
        case "Pending":
          setMessage("Your account is under review. Please wait for admin approval.");
          break;
        case "Rejected":
          setMessage("Your account has been rejected. Please contact support.");
          break;
        case "Active":
          setMessage(null);
          break;
      }
    }
  }, [isLoaded, user, approvalData, router]);

  return {
    isLoading: !isLoaded || (!!user && approvalData === undefined),
    isApproved: approvalData?.status === "Active" || false,
    approvalStatus: approvalData?.status || null,
    message,
    user: approvalData,
  };
};