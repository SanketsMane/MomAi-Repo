"use client";

import { useOrganization } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { IntegrationId, INTEGRATIONS } from "../../constants";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { useState } from "react";
import { createScript } from "../../utils";

export const IntegrationsView = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState("");
  const { organization } = useOrganization();

  const handleIntegrationClick = (integrationId: IntegrationId) => {
    if (!organization) {
      toast.error("Organization ID not found");
      return;
    }

    const snippet = createScript(integrationId, organization.id);
    setSelectedSnippet(snippet);
    setDialogOpen(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(organization?.id ?? "");
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <>
      <IntegrationsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        snippet={selectedSnippet}
      />
      <div className="flex min-h-screen flex-col bg-muted p-8">
        <div className="mx-auto w-full max-w-screen-md">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl">Setup & Integrations</h1>
            <p className="text-muted-foreground">
              Choose the integration that&apos;s right for you
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4">
              <Label className="w-34" htmlFor="organization-id">
                Organization ID
              </Label>
              <Input 
                disabled
                id="organization-id"
                readOnly
                value={organization?.id ?? ""}
                className="flex-1 bg-background font-mono text-sm"
              />
              <Button
                className="gap-2"
                onClick={handleCopy}
                size="sm"
              >
                <CopyIcon className="size-4" />
                Copy
              </Button>
            </div>
          </div>

          <Separator className="my-8" />
          <div className="space-y-6">
            <div className="space-y-1">
              <Label className="text-lg">Integrations</Label>
              <p className="text-muted-foreground text-sm">
                Add the following code to your website to enable the chatbox.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {INTEGRATIONS.map((integration) => (
                <button
                  key={integration.id}
                  onClick={() => handleIntegrationClick(integration.id)}
                  type="button"
                  className="flex flex-col items-center gap-3 rounded-lg border bg-background p-4 hover:bg-accent transition-colors"
                >
                  <Image
                    alt={integration.title}
                    height={40}
                    src={integration.icon}
                    width={40}
                  />
                  <p className="font-medium">{integration.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const IntegrationsDialog = ({
  open,
  onOpenChange,
  snippet,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  snippet: string;
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Integrate with your website</DialogTitle>
          <DialogDescription>
            Follow these steps to add the chatbox to your website
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="rounded-md bg-accent p-3 text-sm font-medium">
              📋 Step 1: Copy the integration code
            </div>
            <div className="group relative">
              <pre className="max-h-[400px] overflow-x-auto overflow-y-auto whitespace-pre-wrap rounded-md bg-foreground p-4 font-mono text-secondary text-sm leading-relaxed">
                {snippet}
              </pre>
              <Button
                className="absolute top-2 right-2 size-8 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={handleCopy}
                size="icon"
                variant="secondary"
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="rounded-md bg-accent p-3 text-sm font-medium">
              🚀 Step 2: Add to your project
            </div>
            <div className="text-muted-foreground text-sm space-y-2">
              <p>
                <strong>For HTML:</strong> Add the script tag before the closing &lt;/body&gt; tag.
              </p>
              <p>
                <strong>For React/Next.js:</strong> Add the code to your main App component or _app.js file.
              </p>
              <p>
                <strong>For JavaScript:</strong> Add the code to your main JavaScript file or load it dynamically.
              </p>
              <p>
                <strong>For Laravel:</strong> Add to your main layout file and configure the environment variables.
              </p>
            </div>
          </div>
          
          <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
            <div className="flex items-center gap-2 text-blue-800 text-sm font-medium mb-1">
              💡 Pro Tip
            </div>
            <p className="text-blue-700 text-sm">
              The widget will automatically appear in the bottom-right corner of your website with a time-based greeting and AI-powered responses!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
