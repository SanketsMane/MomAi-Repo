"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { 
  UsersIcon, 
  PlusIcon, 
  MailIcon,
  CrownIcon,
  UserIcon,
  ShieldIcon,
  ExternalLinkIcon
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const MembersManagementView = () => {
  const { user } = useUser();
  const { organization, membership } = useOrganization();
  const [inviteEmail, setInviteEmail] = useState("");

  const handleInviteMember = () => {
    if (!inviteEmail) return;
    
    // For now, show a message about using Clerk's built-in invitation system
    toast.success("Use your organization's Clerk dashboard to invite members");
    setInviteEmail("");
  };

  if (!user || !organization) {
    return (
      <div className="bg-muted p-8">
        <div className="container mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Please sign in to access member management</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isAdmin = membership?.role === "org:admin";

  if (!isAdmin) {
    return (
      <div className="bg-muted p-8">
        <div className="container mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">You need administrator privileges to manage members</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted p-8">
      <div className="container mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold">Member Management</h1>
          <p className="text-muted-foreground">
            Manage organization members and their roles
          </p>
        </div>

        {/* Organization Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <UsersIcon className="h-5 w-5" />
              Organization Overview
            </CardTitle>
            <CardDescription>
              Current organization information and member count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-background">
                <p className="text-2xl font-bold text-blue-600">
                  {organization.membersCount || 1}
                </p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background">
                <p className="text-2xl font-bold text-green-600">
                  {organization.name}
                </p>
                <p className="text-sm text-muted-foreground">Organization</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background">
                <p className="text-2xl font-bold text-orange-600">
                  {isAdmin ? "Admin" : "Member"}
                </p>
                <p className="text-sm text-muted-foreground">Your Role</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background">
                <p className="text-2xl font-bold text-purple-600">
                  Active
                </p>
                <p className="text-sm text-muted-foreground">Status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invite Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <PlusIcon className="h-5 w-5" />
              Invite New Members
            </CardTitle>
            <CardDescription>
              Add new members to your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleInviteMember} disabled={!inviteEmail}>
                <MailIcon className="mr-2 h-4 w-4" />
                Send Invite
              </Button>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLinkIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Advanced Member Management</span>
              </div>
              <p className="text-sm text-muted-foreground">
                For full member management features, use your{" "}
                <a 
                  href="https://dashboard.clerk.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Clerk Dashboard
                </a>
                {" "}to invite members, manage roles, and configure permissions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <UserIcon className="h-5 w-5" />
              Your Membership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{user.fullName || user.emailAddresses[0]?.emailAddress}</p>
                  <p className="text-sm text-muted-foreground">{user.emailAddresses[0]?.emailAddress}</p>
                </div>
              </div>
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {isAdmin ? (
                  <>
                    <CrownIcon className="mr-1 h-3 w-3" />
                    Administrator
                  </>
                ) : (
                  <>
                    <UserIcon className="mr-1 h-3 w-3" />
                    Member
                  </>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Member Management Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ShieldIcon className="h-5 w-5" />
              Member Management Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a 
                href="https://dashboard.clerk.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon className="mr-2 h-4 w-4" />
                Open Clerk Dashboard
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/dashboard">
                <UsersIcon className="mr-2 h-4 w-4" />
                Back to Dashboard
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};