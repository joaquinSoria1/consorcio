"use client";
 
import {
  AssistantRuntimeProvider,
} from "@assistant-ui/react";
import { useVercelRSCRuntime } from "@assistant-ui/react-ai-sdk";
import { useActions, useUIState } from "ai/rsc";
import { nanoid } from "nanoid";
 
export function MyRuntimeProvider({
  children,
}) {
  const { continueConversation } = useActions();
  const [messages, setMessages] = useUIState();
 
  const append = async (m) => {
    if (m.content[0]?.type !== "text")
      throw new Error("Only text messages are supported");
 
    const input = m.content[0].text;
    setMessages((currentConversation) => [
      ...currentConversation,
      { id: nanoid(), role: "user", display: input },
    ]);
 
    const message = await continueConversation(input);
 
    setMessages((currentConversation) => [...currentConversation, message]);
  };
 
  const runtime = useVercelRSCRuntime({ messages, append });
 
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}