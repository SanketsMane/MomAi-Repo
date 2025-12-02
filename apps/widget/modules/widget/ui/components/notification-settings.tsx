"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { Button } from "@workspace/ui/components/button";
import { Volume2, VolumeX, Settings } from "lucide-react";
import { notificationSettingsAtomFamily, organizationIdAtom } from "../../atoms/widget-atoms";
import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

export const NotificationSettings = ({ className }: { className?: string }) => {
  const organizationId = useAtomValue(organizationIdAtom);
  const notificationSettings = useAtomValue(notificationSettingsAtomFamily(organizationId || ""));
  const setNotificationSettings = useSetAtom(notificationSettingsAtomFamily(organizationId || ""));
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSound = () => {
    setNotificationSettings((prev: any) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled
    }));
  };

  const adjustVolume = (volume: number) => {
    setNotificationSettings((prev: any) => ({
      ...prev,
      volume: Math.max(0.1, Math.min(1, volume))
    }));
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Quick toggle button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={toggleSound}
        className="h-8 w-8"
        title={notificationSettings.soundEnabled ? "Disable notifications" : "Enable notifications"}
      >
        {notificationSettings.soundEnabled ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </Button>

      {/* Expanded settings */}
      {isExpanded && (
        <div className="flex items-center gap-2 bg-background border rounded-lg p-2 shadow-lg">
          <span className="text-xs text-muted-foreground">Volume:</span>
          <div className="flex gap-1">
            {[0.2, 0.5, 0.8].map((vol) => (
              <Button
                key={vol}
                size="sm"
                variant={Math.abs(notificationSettings.volume - vol) < 0.1 ? "default" : "outline"}
                onClick={() => adjustVolume(vol)}
                className="h-6 px-2 text-xs"
              >
                {vol === 0.2 ? "Low" : vol === 0.5 ? "Med" : "High"}
              </Button>
            ))}
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsExpanded(false)}
            className="h-6 w-6"
          >
            ×
          </Button>
        </div>
      )}

      {/* Settings toggle */}
      {!isExpanded && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsExpanded(true)}
          className="h-8 w-8"
          title="Notification settings"
        >
          <Settings className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};