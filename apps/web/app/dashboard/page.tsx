"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { 
  UsersIcon, 
  BuildingIcon, 
  MessageSquareIcon, 
  SettingsIcon,
  PlusIcon,
  CrownIcon,
  UserIcon,
  TrendingUpIcon,
  ActivityIcon
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useUser();
  const { organization, membership } = useOrganization();

  // Note: Organization stats will be implemented with backend support

  if (!user) {
    return (
      <div className="bg-muted p-8">
        <div className="container mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Please sign in to access the dashboard</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isAdmin = membership?.role === "org:admin";

  return (
    <div className="bg-muted p-8">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-4xl font-bold">MOM AI Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.fullName || user.emailAddresses[0]?.emailAddress}
          </p>
        </div>

        {/* Organization Overview */}
        {organization && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BuildingIcon className="h-5 w-5" />
                {organization.name}
              </CardTitle>
              <CardDescription>
                Organization overview and management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
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
                  <span className="text-sm text-muted-foreground">
                    Member since {membership?.createdAt ? new Date(membership.createdAt).toLocaleDateString() : "Unknown"}
                  </span>
                </div>
                {isAdmin && (
                  <Button variant="outline" size="sm">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Invite Members
                  </Button>
                )}
              </div>

              {/* Organization Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-background">
                  <p className="text-2xl font-bold text-blue-600">
                    {organization.membersCount || 1}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background">
                  <p className="text-2xl font-bold text-green-600">
                    {isAdmin ? "Admin" : "Member"}
                  </p>
                  <p className="text-sm text-muted-foreground">Your Role</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background">
                  <p className="text-2xl font-bold text-orange-600">
                    Active
                  </p>
                  <p className="text-sm text-muted-foreground">Status</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background">
                  <p className="text-2xl font-bold text-purple-600">
                    Ready
                  </p>
                  <p className="text-sm text-muted-foreground">System</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Organization Management */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <UsersIcon className="h-5 w-5" />
                  Organization Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/admin/members">
                    <UsersIcon className="mr-2 h-4 w-4" />
                    Manage Members
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/admin/roles">
                    <CrownIcon className="mr-2 h-4 w-4" />
                    Manage Roles
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/admin/settings">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Organization Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Customer Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MessageSquareIcon className="h-5 w-5" />
                Customer Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/conversations">
                  <MessageSquareIcon className="mr-2 h-4 w-4" />
                  View Conversations
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/agent">
                  <ActivityIcon className="mr-2 h-4 w-4" />
                  Agent Dashboard
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/admin/common-knowledge-base">
                  <TrendingUpIcon className="mr-2 h-4 w-4" />
                  Knowledge Base
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <SettingsIcon className="h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/customization">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Widget Customization
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/integrations">
                  <BuildingIcon className="mr-2 h-4 w-4" />
                  Integrations
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/plugins/vapi">
                  <MessageSquareIcon className="mr-2 h-4 w-4" />
                  Voice Assistant
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ActivityIcon className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Recent organization activity will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}