"use client";

import { AISuggestion, AISuggestions } from "@workspace/ui/components/ai/suggestion";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { Button } from "@workspace/ui/components/button";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowLeftIcon, MenuIcon } from "lucide-react";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { contactSessionIdAtomFamily, conversationIdAtom, organizationIdAtom, screenAtom, widgetSettingsAtom, notificationSettingsAtomFamily } from "../../atoms/widget-atoms";
import { useAction, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Form, FormField } from "@workspace/ui/components/form";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@workspace/ui/components/ai/input";
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { useMemo, useState, useEffect, useRef } from "react";
import { ThinkingAnimation } from "@/modules/widget/ui/components/thinking-animation";
import { QueueStatus, EscalationStatus } from "@/modules/widget/ui/components/queue-status";
import { useNotificationSound } from "@/hooks/use-notification-sound";
import { NotificationSettings } from "@/modules/widget/ui/components/notification-settings";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export const WidgetChatScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const conversationId = useAtomValue(conversationIdAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  // AI thinking state
  const [isThinking, setIsThinking] = useState(false);
  
  // Visual notification indicator
  const [showNotificationPing, setShowNotificationPing] = useState(false);
  
  // Notification settings
  const notificationSettings = useAtomValue(notificationSettingsAtomFamily(organizationId || ""));
  
  // Notification sound system with multiple sound types
  const { playIncoming, playOutgoing, playTyping, playError } = useNotificationSound({ 
    enabled: notificationSettings.soundEnabled, 
    volume: notificationSettings.volume 
  });
  const previousMessageCountRef = useRef(0);
  const hasUserInteractedRef = useRef(false);

  const onBack = () => {
    setConversationId(null);
    setScreen("selection");
  };

  const suggestions = useMemo(() => {
    if (!widgetSettings) {
      // Return default suggestions if no widget settings exist
      return [
        "Can you explain shift creation?",
        "How do I get started?", 
        "What features are available?"
      ];
    }

    const userSuggestions = Object.values(widgetSettings.defaultSuggestions)
      .filter(Boolean) // Remove empty suggestions
      .filter((suggestion, index, array) => array.indexOf(suggestion) === index); // Remove duplicates

    // If no user suggestions, return defaults
    if (userSuggestions.length === 0) {
      return [
        "Can you explain shift creation?",
        "How do I get started?", 
        "What features are available?"
      ];
    }

    return userSuggestions;
  }, [widgetSettings]);

  const conversation = useQuery(
    api.public.conversations.getOne,
    conversationId && contactSessionId
      ? {
          conversationId,
          contactSessionId,
        } 
      : "skip"
  );

  const messages = useThreadMessages(
    api.public.messages.getMany,
    conversation?.threadId && contactSessionId
      ? {
          threadId: conversation.threadId,
          contactSessionId,
        }
      : "skip",
    { initialNumItems: 10 },
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({
    status: messages.status,
    loadMore: messages.loadMore,
    loadSize: 10,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const createMessage = useAction(api.public.messages.create);
  
  // Track user interaction to enable sound notifications
  useEffect(() => {
    const handleUserInteraction = () => {
      hasUserInteractedRef.current = true;
    };
    
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);
  
  // Play notification sound for new assistant messages
  useEffect(() => {
    if (!messages.results) return;
    
    const uiMessages = toUIMessages(messages.results);
    if (!uiMessages) return;
    
    const currentMessageCount = uiMessages.length;
    const assistantMessages = uiMessages.filter(msg => msg.role === 'assistant');
    
    // Only play sound if:
    // 1. User has interacted with the page (browser policy)
    // 2. We have more messages than before
    // 3. It's not the initial load
    if (
      hasUserInteractedRef.current &&
      currentMessageCount > previousMessageCountRef.current &&
      previousMessageCountRef.current > 0 // Not initial load
    ) {
      // Determine which sound to play based on the latest message
      const latestMessage = uiMessages[uiMessages.length - 1];
      
      // Small delay to ensure message is displayed
      setTimeout(() => {
        if (latestMessage?.role === 'assistant') {
          playIncoming(); // AI response
          // Show visual notification ping
          setShowNotificationPing(true);
          setTimeout(() => setShowNotificationPing(false), 2000);
        }
      }, 100);
    }
    
    previousMessageCountRef.current = currentMessageCount;
  }, [messages.results, playIncoming]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!conversation || !contactSessionId) {
      return;
    }
    
    // Mark that user has interacted
    hasUserInteractedRef.current = true;
    
    // Play outgoing message sound
    playOutgoing();
    
    // Show thinking animation
    setIsThinking(true);
    form.reset();

    try {
      await createMessage({
        threadId: conversation.threadId,
        prompt: values.message,
        contactSessionId,
      });
    } catch (error) {
      // Play error sound if message fails
      playError();
      console.error('Failed to send message:', error);
    } finally {
      // Hide thinking animation after response
      setIsThinking(false);
    }
  };

  return (
    <>
      <WidgetHeader className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button
            onClick={onBack}
            size="icon"
            variant="ghost"
          >
            <ArrowLeftIcon />
          </Button>
          <p>Chat</p>
          {showNotificationPing && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
        <NotificationSettings />
      </WidgetHeader>
      <AIConversation>
        <AIConversationContent>
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
          {toUIMessages(messages.results ?? [])?.map((message) => {
            return (
              <AIMessage
                from={message.role === "user" ? "user" : "assistant"}
                key={message.id}
              >
                <AIMessageContent>
                  <AIResponse>{message.content}</AIResponse>
                </AIMessageContent>
                {message.role === "assistant" && (
                  <DicebearAvatar
                    imageUrl="/logo.svg"
                    seed="assistant"
                    size={32}
                  />
                )}
              </AIMessage>
            )
          })}
          {/* Show thinking animation when AI is processing */}
          {isThinking && <ThinkingAnimation />}
        </AIConversationContent>
      </AIConversation>
      
      {/* Queue Status - Show when conversation is in queue */}
      {conversationId && contactSessionId && (
        <QueueStatus 
          conversationId={conversationId}
          contactSessionId={contactSessionId}
        />
      )}
      
      {/* Escalation Status - Show when escalated or resolved */}
      {conversation && (
        <EscalationStatus conversationStatus={conversation.status} />
      )}
{(() => {
        const uiMessages = toUIMessages(messages.results ?? []);
        const hasUserMessages = uiMessages?.some(message => message.role === "user");
        
        // Show suggestions only when there are no user messages yet
        return !hasUserMessages && suggestions.length > 0 && (
          <AISuggestions className="flex w-full flex-col items-end p-2">
            {suggestions.map((suggestion, index) => {
              if (!suggestion) {
                return null;
              }

              return (
                <AISuggestion
                  key={suggestion}
                  onClick={() => {
                    form.setValue("message", suggestion, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    });

                    form.handleSubmit(onSubmit)();
                  }}
                  suggestion={suggestion}
                />
              )
            })}
          </AISuggestions>
        );
      })()}
      <Form {...form}>
          <AIInput
            className="rounded-none border-x-0 border-b-0"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              disabled={conversation?.status === "resolved"}
              name="message"
              render={({ field }) => (
                <AIInputTextarea
                  disabled={conversation?.status === "resolved"}
                  onChange={field.onChange}

                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                  placeholder={
                    conversation?.status === "resolved"
                      ? "This conversation has been resolved."
                      : "Type your message..."
                  }
                  value={field.value}
                />
              )}
            />
            <AIInputToolbar>
              <AIInputTools />
              <AIInputSubmit
                disabled={conversation?.status === "resolved" || !form.formState.isValid}
                status="ready"
                type="submit"
              />
            </AIInputToolbar>
          </AIInput>
      </Form>

    </>
  );
};
