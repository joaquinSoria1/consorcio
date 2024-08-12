"use client";;
import { BotIcon, ChevronDownIcon } from "lucide-react";

import { ChatClient } from './chatClient';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { forwardRef } from "react";
import { AssistantModalPrimitive } from "@assistant-ui/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const AssistantModal = ({ imagenPerfil, username }) => {
  return (
    (<AssistantModalPrimitive.Root>
      <AssistantModalPrimitive.Trigger asChild>
        <FloatingAssistantButton />
      </AssistantModalPrimitive.Trigger>
      <AssistantModalPrimitive.Content
        sideOffset={16}
        className={
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 slide-in-from-bottom-2 bg-popover text-popover-foreground data-[state=closed]:animate-out data-[state=open]:animate-in z-50 h-[550px] w-[700px] rounded-xl border p-0 shadow-md outline-none"
        }>
        <ChatClient imagenPerfil={imagenPerfil} username={username} />
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>)
  );
};

const FloatingAssistantButton = forwardRef(({ "data-state": state, ...rest }, ref) => {
  const tooltip = state === "open" ? "Cerrar asistente" : "Abrir asistente";

  return (
    (<TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="default"
            size="icon"
            {...rest}
            className="hover:scale-70 fixed bottom-4 right-4 size-14 rounded-full shadow"
            ref={ref}>
            <Avatar className={cn(
                "absolute size-14 transition-all",
                state === "open" && "rotate-90 scale-0",
                state === "closed" && "rotate-0 scale-100"
              )} >
              <AvatarImage src={`/assets/manolito1.png`} />
              <AvatarFallback></AvatarFallback>
            </Avatar>
            <ChevronDownIcon
              className={cn(
                "absolute size-6 transition-all",
                state === "open" && "rotate-0 scale-100",
                state === "closed" && "-rotate-90 scale-0"
              )} />
            <span className="sr-only">{tooltip}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>)
  );
});

FloatingAssistantButton.displayName = "FloatingAssistantButton";
