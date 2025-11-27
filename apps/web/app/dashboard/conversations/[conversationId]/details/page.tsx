import { ConversationDetailView } from "../../../../../modules/dashboard/ui/views/conversation-detail-view";
import { Id } from "@workspace/backend/_generated/dataModel";

interface ConversationDetailsPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ConversationDetailsPage({ params }: ConversationDetailsPageProps) {
  const { conversationId } = await params;
  return <ConversationDetailView conversationId={conversationId as Id<"conversations">} />;
}