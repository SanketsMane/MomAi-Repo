"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { 
  CrownIcon,
  UserIcon,
  ShieldIcon,
  UsersIcon
} from "lucide-react";

export const RolesManagementView = () => {
  const { user } = useUser();
  const { organization, membership } = useOrganization();

  if (!user || !organization) {
    return (
      <div className="bg-muted p-8">
        <div className="container mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Please sign in to access role management</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const roles = [
    {
      id: "admin",
      name: "Administrator",
      description: "Full access to organization settings and member management",
      icon: CrownIcon,
      permissions: [
        "Manage organization settings",
        "Invite and remove members",
        "Assign roles to members",
        "Access all conversations",
        "Manage knowledge base",
        "Configure integrations",
        "View analytics and reports"
      ]
    },
    {
      id: "member",
      name: "Member",
      description: "Standard member with access to conversations and basic features",
      icon: UserIcon,
      permissions: [
        "View assigned conversations",
        "Access knowledge base",
        "Update agent status",
        "View organization dashboard",
        "Participate in team activities"
      ]
    },
    {
      id: "agent",
      name: "Support Agent",
      description: "Specialized role for customer support agents",
      icon: ShieldIcon,
      permissions: [
        "Handle customer conversations",
        "Access agent dashboard",
        "Update availability status",
        "View workload metrics",
        "Access knowledge base",
        "Escalate conversations"
      ]
    }
  ];

  return (
    <div className="bg-muted p-8">
      <div className="container mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">
            Understand the different roles and permissions in your organization
          </p>
        </div>

        {/* Current User Role */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <UsersIcon className="h-5 w-5" />
              Your Current Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                {membership?.role === "org:admin" ? (
                  <CrownIcon className="h-6 w-6" />
                ) : (
                  <UserIcon className="h-6 w-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{user.fullName || user.emailAddresses[0]?.emailAddress}</p>
                  <Badge variant={membership?.role === "org:admin" ? "default" : "secondary"}>
                    {membership?.role === "org:admin" ? "Administrator" : "Member"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {membership?.role === "org:admin" 
                    ? "You have full administrative privileges"
                    : "You have standard member access"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Roles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    {role.name}
                  </CardTitle>
                  <CardDescription>
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Permissions:</p>
                    <ul className="space-y-1">
                      {role.permissions.map((permission, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="h-1 w-1 bg-muted-foreground rounded-full" />
                          {permission}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};