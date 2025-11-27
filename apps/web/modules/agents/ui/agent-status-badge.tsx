import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

type AgentStatus = "available" | "busy" | "not_available";

interface AgentStatusBadgeProps {
  status: AgentStatus;
  conversationCount?: number;
  className?: string;
}

export const AgentStatusBadge = ({ 
  status, 
  conversationCount = 0, 
  className 
}: AgentStatusBadgeProps) => {
  const getStatusConfig = (status: AgentStatus) => {
    switch (status) {
      case "available":
        return {
          label: "Available",
          variant: "default" as const,
          className: "bg-green-500 text-white hover:bg-green-600",
        };
      case "busy":
        return {
          label: `Busy (${conversationCount}/2)`,
          variant: "secondary" as const,
          className: "bg-yellow-500 text-white hover:bg-yellow-600",
        };
      case "not_available":
        return {
          label: "Not Available",
          variant: "destructive" as const,
          className: "bg-red-500 text-white hover:bg-red-600",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant={config.variant} 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
};