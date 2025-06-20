"use client";

import { Chatbot } from "@/types/types";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Avatar from "./Avatar";
import Link from "next/link";
import ReactTimeago from "react-timeago";

function ChatbotSessions({ chatbots }: {chatbots: Chatbot[]}) {
  const [sortedChatbots, setSortedChatbots] = useState<Chatbot[]>(chatbots);

  useEffect(() => {
    const sortedArray = [...chatbots].sort(
      (a, b): number =>
        // most used chatbots first
        b.chat_sessions.length - a.chat_sessions.length
    );

    setSortedChatbots(sortedArray);
  }, [chatbots]);
  
  return (
    <div className="bg-white">
      <Accordion type ="single" collapsible>
        {sortedChatbots.map((chatbot) => {
          const hasSessions = chatbot.chat_sessions.length > 0;

          return(
            <AccordionItem 
              key={chatbot.id} 
              value={`item-${chatbot.id}`}
              className="px-10 py-5"
            >
              {hasSessions ? (
                <>
                  <AccordionTrigger>
                    <div className="flex items-center text-left w-full">
                      <Avatar seed={chatbot.name} className="h-10 w-10 mr-4"/>
                      <div className="flex flex-1 justify-between space-x-4">
                        <p>{chatbot.name}</p>
                        <p className="pr-4 font-bold text-right">
                          {chatbot.chat_sessions.length} Sessions
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-5 p-5 bg-gray-100 rounded-md"> 
                  {chatbot.chat_sessions.map((session) => (
                    <Link
                      href={`/review-sessions/${session.id}`}
                      key={session.id}
                      className="relative p-10 bg-[#2991EE] text-white rounded-md block"
                    >
                      <p className="text-lg font-bold">

                        {/* Fixed by Copilot, might be wrong !!! */}
                        {session.guests?.[0]?.name || "Anonymous"}
                      </p>
                      <p>
                        {/* Fixed by Copilot, might be wrong !!! */}
                        {session.guests?.[0]?.email || "No email provided"}
                      </p>
                      <p>
                        <ReactTimeago date={new Date(session.created_at)} />
                      </p>
                    </Link>
                  ))};
                  </AccordionContent>
                </>
              ): (
                <p className="font-light">{chatbot.name} (No Sessions)</p>
              )}
            </AccordionItem>
          );
        })}

      </Accordion>
    </div>
  );
}

export default ChatbotSessions