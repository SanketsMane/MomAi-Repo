"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import { 
  SettingsIcon, 
  BuildingIcon,
  SaveIcon,
  InfoIcon,
  ShieldIcon,
  BellIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const OrganizationSettingsView = () => {
  const { user } = useUser();
  const { organization, membership } = useOrganization();
  
  const [settings, setSettings] = useState({
    displayName: "",
    description: "",
    allowMemberInvites: false,
    requireApprovalForJoining: true,
    enableNotifications: true,
    defaultAgentStatus: "available" as const
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // Note: Organization settings will be implemented with backend support

  useEffect(() => {
    if (organization) {
      setSettings(prev => ({
        ...prev,
        displayName: organization.name
      }));
    }
  }, [organization]);

  const handleSaveSettings = async () => {
    if (!organization) return;

    setIsSaving(true);
    try {
      // For now, just show success message
      // Backend implementation will be added later
      toast.success("Settings saved locally - backend integration pending");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || !organization) {
    return (
      <div className="bg-muted p-8">
        <div className="container mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Please sign in to access organization settings</p>
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
              <p className="text-muted-foreground">You need administrator privileges to manage organization settings</p>
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
          <h1 className="text-2xl md:text-4xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground">
            Configure your organization preferences and policies
          </p>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BuildingIcon className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Update your organization's basic details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={settings.displayName}
                onChange={(e) => setSettings(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Enter organization display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of your organization"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Member Management Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ShieldIcon className="h-5 w-5" />
              Member Management
            </CardTitle>
            <CardDescription>
              Configure how members can join and interact in your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Allow Member Invites</Label>
                <p className="text-sm text-muted-foreground">
                  Let members invite others to join the organization
                </p>
              </div>
              <Switch
                checked={settings.allowMemberInvites}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, allowMemberInvites: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Require Approval for Joining</Label>
                <p className="text-sm text-muted-foreground">
                  New members need admin approval before accessing the organization
                </p>
              </div>
              <Switch
                checked={settings.requireApprovalForJoining}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, requireApprovalForJoining: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BellIcon className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure organization-wide notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications for important organization events
                </p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, enableNotifications: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Organization Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <InfoIcon className="h-5 w-5" />
              Organization Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Organization ID</p>
                <p className="text-muted-foreground font-mono">{organization.id}</p>
              </div>
              <div>
                <p className="font-medium">Created</p>
                <p className="text-muted-foreground">
                  {new Date(organization.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="font-medium">Members</p>
                <p className="text-muted-foreground">{organization.membersCount || 0}</p>
              </div>
              <div>
                <p className="font-medium">Your Role</p>
                <p className="text-muted-foreground">
                  {membership?.role === "org:admin" ? "Administrator" : "Member"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full"
            >
              <SaveIcon className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};