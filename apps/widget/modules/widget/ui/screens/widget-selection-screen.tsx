"use client";

import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { Button } from "@workspace/ui/components/button";
import { useAtomValue, useSetAtom } from "jotai";
import { ChevronRightIcon, MessageSquareTextIcon, MicIcon, PhoneIcon } from "lucide-react";
import { contactSessionIdAtomFamily, conversationIdAtom, errorMessageAtom, hasVapiSecretsAtom, organizationIdAtom, screenAtom, widgetSettingsAtom } from "../../atoms/widget-atoms";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useState } from "react";
import { WidgetFooter } from "../components/widget-footer";
import { GreetingPopup } from "@/modules/widget/ui/components/greeting-popup";
import { useGreetingPopup } from "@/hooks/use-greeting-popup";

export const WidgetSelectionScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const hasVapiSecrets = useAtomValue(hasVapiSecretsAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  const createConversation = useMutation(api.public.conversations.create);
  const [isPending, setIsPending] = useState(false);

  // Greeting popup logic - shows when widget is first initialized
  const { isVisible: isGreetingVisible, handleUserInteraction } = useGreetingPopup();

  const handleNewConversation = async () => {
    if (!organizationId) {
      setScreen("error");
      setErrorMessage("Missing Organization ID");
      return;
    }
    
    if (!contactSessionId) {
      setScreen("auth");
      return;
    }
    
    setIsPending(true);
    try {
      const conversationId = await createConversation({
        contactSessionId,
        organizationId,
      });

      setConversationId(conversationId);
      setScreen("chat");
    } catch {
      setScreen("auth");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-2xl">
            👋 MOM AI
          </p>
          <p className="text-lg">
            Hi there! Let&apos;s get you started
          </p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col gap-y-4 p-4 overflow-y-auto">
        <Button
          className="h-16 w-full justify-between"
          variant="outline"
          onClick={() => {
            handleUserInteraction(); // Dismiss greeting popup when user starts chat
            handleNewConversation();
          }}
          disabled={isPending}
        >
          <div className="flex items-center gap-x-2">
            <MessageSquareTextIcon className="size-4" />
            <span>Start chat</span>
          </div>
          <ChevronRightIcon />
        </Button>
        {hasVapiSecrets && widgetSettings?.vapiSettings?.assistantId && (
          <Button
            className="h-16 w-full justify-between"
            variant="outline"
            onClick={() => {
              handleUserInteraction(); // Dismiss greeting popup when user starts voice call
              setScreen("voice");
            }}
            disabled={isPending}
          >
            <div className="flex items-center gap-x-2">
              <MicIcon className="size-4" />
              <span>Start voice call</span>
            </div>
            <ChevronRightIcon />
          </Button>
        )}
        {hasVapiSecrets && widgetSettings?.vapiSettings?.phoneNumber && (
          <Button
            className="h-16 w-full justify-between"
            variant="outline"
            onClick={() => {
              handleUserInteraction(); // Dismiss greeting popup when user opens contact
              setScreen("contact");
            }}
            disabled={isPending}
          >
            <div className="flex items-center gap-x-2">
              <PhoneIcon className="size-4" />
              <span>Call us</span>
            </div>
            <ChevronRightIcon />
          </Button>
        )}
      </div>
      <WidgetFooter />
      
      {/* Greeting Popup - shows when widget is first initialized */}
      <GreetingPopup isVisible={isGreetingVisible} onDismiss={handleUserInteraction} />
    </>
  );
};
